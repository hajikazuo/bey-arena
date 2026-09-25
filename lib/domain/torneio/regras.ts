import type { RegrasTorneio } from "@/types/torneio";
import type { TipoFinalizacao } from "@/types/batalha";

export class RegraDeNegocioError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RegraDeNegocioError";
  }
}

export function validarRegrasTorneio(regras: RegrasTorneio): void {
  if (!Number.isInteger(regras.pontosParaVencer) || regras.pontosParaVencer <= 0) {
    throw new RegraDeNegocioError("A pontuação para vencer deve ser maior que zero.");
  }

  const pontuacoes = [
    regras.pontosSpinFinish,
    regras.pontosOverFinish,
    regras.pontosBurstFinish,
    regras.pontosExtremeFinish,
  ];

  if (pontuacoes.some((pontuacao) => !Number.isInteger(pontuacao) || pontuacao < 0)) {
    throw new RegraDeNegocioError("As pontuações de finalização não podem ser negativas.");
  }
}

export function pontuacaoDaFinalizacao(
  finalizacao: TipoFinalizacao,
  regras: RegrasTorneio,
): number {
  validarRegrasTorneio(regras);

  const pontuacoes: Record<TipoFinalizacao, number> = {
    spin: regras.pontosSpinFinish,
    over: regras.pontosOverFinish,
    burst: regras.pontosBurstFinish,
    extreme: regras.pontosExtremeFinish,
  };

  return pontuacoes[finalizacao];
}

export interface Placar {
  jogador1: number;
  jogador2: number;
}

export function aplicarPonto(
  placar: Placar,
  vencedor: "jogador1" | "jogador2",
  pontos: number,
): Placar {
  if (!Number.isInteger(pontos) || pontos < 0) {
    throw new RegraDeNegocioError("A pontuação concedida deve ser um inteiro não negativo.");
  }

  return {
    jogador1: placar.jogador1 + (vencedor === "jogador1" ? pontos : 0),
    jogador2: placar.jogador2 + (vencedor === "jogador2" ? pontos : 0),
  };
}

export function partidaFoiVencida(placar: Placar, pontosParaVencer: number): boolean {
  return Math.max(placar.jogador1, placar.jogador2) >= pontosParaVencer;
}

export function validarVencedorDaBatalha(
  jogador1Id: string,
  jogador2Id: string,
  vencedorId: string,
): "jogador1" | "jogador2" {
  if (vencedorId === jogador1Id) return "jogador1";
  if (vencedorId === jogador2Id) return "jogador2";
  throw new RegraDeNegocioError("O vencedor precisa ser um dos jogadores da partida.");
}
