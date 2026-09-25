import type { TipoChave } from "@/types/partida";
import { RegraDeNegocioError } from "./regras";

export interface ParticipanteParaChaveamento {
  id: string;
  cabecaDeChave?: number;
}

export interface PartidaGerada {
  chave: TipoChave;
  rodada: number;
  posicao: number;
  jogador1Id?: string;
  jogador2Id?: string;
  status: "pendente" | "pronta" | "bye";
}

function proximaPotenciaDeDois(numero: number): number {
  return 2 ** Math.ceil(Math.log2(numero));
}

/** Gera a primeira rodada de uma chave simples; o avanço é responsabilidade do caso de uso. */
export function gerarPrimeiraRodada(
  participantes: ParticipanteParaChaveamento[],
): PartidaGerada[] {
  if (participantes.length < 2) {
    throw new RegraDeNegocioError("Um torneio precisa de pelo menos dois participantes.");
  }

  const ordenados = [...participantes].sort(
    (a, b) => (a.cabecaDeChave ?? Number.MAX_SAFE_INTEGER) - (b.cabecaDeChave ?? Number.MAX_SAFE_INTEGER),
  );
  const tamanhoDaChave = proximaPotenciaDeDois(ordenados.length);
  const vagas = [...ordenados, ...Array(tamanhoDaChave - ordenados.length).fill(undefined)];

  return Array.from({ length: tamanhoDaChave / 2 }, (_, indice) => {
    const jogador1 = vagas[indice * 2];
    const jogador2 = vagas[indice * 2 + 1];
    const quantidadeDeJogadores = Number(Boolean(jogador1)) + Number(Boolean(jogador2));

    return {
      chave: "vencedores",
      rodada: 1,
      posicao: indice + 1,
      jogador1Id: jogador1?.id,
      jogador2Id: jogador2?.id,
      status: quantidadeDeJogadores < 2 ? "bye" : quantidadeDeJogadores === 2 ? "pronta" : "pendente",
    };
  });
}
