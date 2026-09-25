import type { RegrasTorneio } from "@/types/torneio";
import type { TipoFinalizacao } from "@/types/batalha";
import { RegraDeNegocioError } from "../errors";

export function validarRegrasTorneio(regras: RegrasTorneio): void {
  if (!Number.isInteger(regras.pontosParaVencer) || !Number.isFinite(regras.pontosParaVencer) || regras.pontosParaVencer <= 0) {
    throw new RegraDeNegocioError("A pontuação para vencer deve ser maior que zero.");
  }

  const pontuacoes = [
    regras.pontosSpinFinish,
    regras.pontosOverFinish,
    regras.pontosBurstFinish,
    regras.pontosExtremeFinish,
  ];

  if (pontuacoes.some((pontuacao) => !Number.isInteger(pontuacao) || !Number.isFinite(pontuacao) || pontuacao < 0)) {
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

  const pontuacao = pontuacoes[finalizacao];
  if (pontuacao === undefined) throw new RegraDeNegocioError("Tipo de finalização inválido.");
  return pontuacao;
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
  validarPlacar(placar);
  if (!Number.isInteger(pontos) || !Number.isFinite(pontos) || pontos < 0) {
    throw new RegraDeNegocioError("A pontuação concedida deve ser um inteiro não negativo.");
  }
  if (vencedor !== "jogador1" && vencedor !== "jogador2") {
    throw new RegraDeNegocioError("O vencedor precisa indicar jogador1 ou jogador2.");
  }

  return {
    jogador1: placar.jogador1 + (vencedor === "jogador1" ? pontos : 0),
    jogador2: placar.jogador2 + (vencedor === "jogador2" ? pontos : 0),
  };
}

export function partidaFoiVencida(placar: Placar, pontosParaVencer: number): boolean {
  validarPlacar(placar);
  if (!Number.isInteger(pontosParaVencer) || !Number.isFinite(pontosParaVencer) || pontosParaVencer <= 0) {
    throw new RegraDeNegocioError("A pontuação para vencer deve ser um inteiro maior que zero.");
  }
  return Math.max(placar.jogador1, placar.jogador2) >= pontosParaVencer;
}

export function validarPlacar(placar: Placar): void {
  if (!Number.isInteger(placar.jogador1) || !Number.isFinite(placar.jogador1) || placar.jogador1 < 0 ||
      !Number.isInteger(placar.jogador2) || !Number.isFinite(placar.jogador2) || placar.jogador2 < 0) {
    throw new RegraDeNegocioError("O placar deve conter inteiros não negativos e finitos.");
  }
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
