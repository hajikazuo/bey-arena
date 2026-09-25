import { RegraDeNegocioError } from "../../errors";
import type { ChaveamentoGerado, GeradorDeChaveamento, ParticipanteParaChaveamento, PartidaGerada } from "./tipos";

function ehPotenciaDeDois(valor: number): boolean { return valor > 0 && (valor & (valor - 1)) === 0; }

export function calcularTamanhoDaChave(quantidadeDeParticipantes: number): number {
  if (!Number.isInteger(quantidadeDeParticipantes) || quantidadeDeParticipantes < 2) {
    throw new RegraDeNegocioError("Um torneio precisa de pelo menos dois participantes.");
  }
  let tamanho = 2;
  while (tamanho < quantidadeDeParticipantes) tamanho *= 2;
  return tamanho;
}

/** Ordem determinística dos slots: 1xN, N/2xN/2+1, 2xN-1, 3xN-2... */
export function gerarOrdemDeSeeds(tamanhoDaChave: number): number[] {
  if (!ehPotenciaDeDois(tamanhoDaChave) || tamanhoDaChave < 2) {
    throw new RegraDeNegocioError("O tamanho da chave deve ser uma potência de dois.");
  }
  let ordem = [1, 2];
  while (ordem.length < tamanhoDaChave) {
    const novoTamanho = ordem.length * 2;
    ordem = ordem.flatMap((seed) => [seed, novoTamanho + 1 - seed]);
  }
  return ordem;
}

export function validarParticipantes(participantes: ParticipanteParaChaveamento[]): void {
  const ids = new Set<string>();
  for (const participante of participantes) {
    if (!participante.id.trim()) throw new RegraDeNegocioError("Todo participante precisa ter um ID.");
    if (ids.has(participante.id)) throw new RegraDeNegocioError(`Participante duplicado: ${participante.id}.`);
    ids.add(participante.id);
    if (participante.cabecaDeChave !== undefined && (!Number.isInteger(participante.cabecaDeChave) || participante.cabecaDeChave <= 0)) {
      throw new RegraDeNegocioError(`Cabeça de chave inválida para ${participante.id}.`);
    }
  }
  const seeds = participantes.map((p) => p.cabecaDeChave).filter((seed): seed is number => seed !== undefined);
  if (new Set(seeds).size !== seeds.length) throw new RegraDeNegocioError("Não pode haver cabeças de chave duplicadas.");
}

export function distribuirParticipantes(participantes: ParticipanteParaChaveamento[], tamanhoDaChave: number): (ParticipanteParaChaveamento | undefined)[] {
  validarParticipantes(participantes);
  const ordemDeSeeds = gerarOrdemDeSeeds(tamanhoDaChave);
  const slots: (ParticipanteParaChaveamento | undefined)[] = Array(tamanhoDaChave).fill(undefined);
  const semSeed: ParticipanteParaChaveamento[] = [];
  for (const participante of participantes) {
    if (participante.cabecaDeChave === undefined) { semSeed.push(participante); continue; }
    if (participante.cabecaDeChave > participantes.length || participante.cabecaDeChave > tamanhoDaChave) {
      throw new RegraDeNegocioError(`Cabeça de chave impossível: ${participante.cabecaDeChave}.`);
    }
    slots[ordemDeSeeds.indexOf(participante.cabecaDeChave)] = participante;
  }
  semSeed.sort((a, b) => a.id.localeCompare(b.id));
  let indice = 0;
  for (const seed of ordemDeSeeds) {
    const slot = ordemDeSeeds.indexOf(seed);
    if (slots[slot] === undefined) slots[slot] = semSeed[indice++];
  }
  return slots;
}

export class EliminacaoSimples implements GeradorDeChaveamento {
  gerar(participantes: ParticipanteParaChaveamento[]): ChaveamentoGerado {
    validarParticipantes(participantes);
    const tamanhoDaChave = calcularTamanhoDaChave(participantes.length);
    const slots = distribuirParticipantes(participantes, tamanhoDaChave);
    const partidas: PartidaGerada[] = [];
    for (let indice = 0; indice < tamanhoDaChave; indice += 2) {
      const jogador1 = slots[indice]; const jogador2 = slots[indice + 1];
      const quantidade = Number(jogador1 !== undefined) + Number(jogador2 !== undefined);
      partidas.push({ chave: "vencedores", rodada: 1, posicao: indice / 2 + 1,
        jogador1Id: jogador1?.id, jogador2Id: jogador2?.id,
        status: quantidade === 2 ? "pronta" : quantidade === 1 ? "bye" : "pendente" });
    }
    return { tamanhoDaChave, partidas };
  }
}

export function gerarPrimeiraRodada(participantes: ParticipanteParaChaveamento[]): PartidaGerada[] {
  return new EliminacaoSimples().gerar(participantes).partidas;
}
