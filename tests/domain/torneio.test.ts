import assert from "node:assert/strict";
import test from "node:test";
import {
  aplicarPonto,
  partidaFoiVencida,
  pontuacaoDaFinalizacao,
  validarRegrasTorneio,
  validarVencedorDaBatalha,
} from "../../lib/domain/torneio/regras";
import {
  EliminacaoSimples,
  gerarOrdemDeSeeds,
  gerarPrimeiraRodada,
} from "../../lib/domain/torneio";
import { RegraDeNegocioError } from "../../lib/domain/errors";
import type { RegrasTorneio } from "../../types/torneio";

const regras: RegrasTorneio = {
  pontosParaVencer: 4,
  pontosSpinFinish: 1,
  pontosOverFinish: 2,
  pontosBurstFinish: 2,
  pontosExtremeFinish: 3,
};

const participantes = (quantidade: number) =>
  Array.from({ length: quantidade }, (_, indice) => ({ id: `p${indice + 1}` }));

const deveFalhar = (fn: () => unknown, trecho: string) => {
  assert.throws(fn, (erro: unknown) => erro instanceof RegraDeNegocioError && erro.message.includes(trecho));
};

test("calcula pontuação e vitória com regras válidas", () => {
  validarRegrasTorneio(regras);
  assert.equal(pontuacaoDaFinalizacao("extreme", regras), 3);
  assert.deepEqual(aplicarPonto({ jogador1: 1, jogador2: 0 }, "jogador2", 2), { jogador1: 1, jogador2: 2 });
  assert.equal(partidaFoiVencida({ jogador1: 4, jogador2: 2 }, 4), true);
});

test("rejeita regras e valores numéricos inválidos", () => {
  deveFalhar(() => validarRegrasTorneio({ ...regras, pontosParaVencer: 0 }), "maior que zero");
  deveFalhar(() => validarRegrasTorneio({ ...regras, pontosOverFinish: -1 }), "não podem ser negativas");
  deveFalhar(() => aplicarPonto({ jogador1: 1.5, jogador2: 0 }, "jogador1", 1), "placar");
  deveFalhar(() => aplicarPonto({ jogador1: 0, jogador2: 0 }, "jogador1", Number.NaN), "pontuação");
  deveFalhar(() => partidaFoiVencida({ jogador1: 0, jogador2: 0 }, Infinity), "maior que zero");
});

test("rejeita vencedor que não participa da partida", () => {
  deveFalhar(() => validarVencedorDaBatalha("a", "b", "c"), "um dos jogadores");
});

test("gera tamanhos corretos para vários números de participantes", () => {
  for (const [quantidade, tamanho] of [[2, 2], [3, 4], [4, 4], [5, 8], [8, 8], [13, 16]] as const) {
    const chave = new EliminacaoSimples().gerar(participantes(quantidade));
    assert.equal(chave.tamanhoDaChave, tamanho);
    assert.equal(chave.partidas.length, tamanho / 2);
  }
});

test("distribui seeds de modo determinístico", () => {
  assert.deepEqual(gerarOrdemDeSeeds(8), [1, 8, 4, 5, 2, 7, 3, 6]);
  const chave = new EliminacaoSimples().gerar([
    { id: "seed-1", cabecaDeChave: 1 },
    { id: "seed-2", cabecaDeChave: 2 },
    { id: "seed-3", cabecaDeChave: 3 },
    { id: "seed-4", cabecaDeChave: 4 },
    { id: "a" },
    { id: "b" },
    { id: "c" },
    { id: "d" },
  ]);
  assert.deepEqual(chave.partidas[0], { chave: "vencedores", rodada: 1, posicao: 1, jogador1Id: "seed-1", jogador2Id: "a", status: "pronta" });
  assert.equal(chave.partidas[2].jogador1Id, "seed-2");
});

test("rejeita seeds duplicados, inválidos, impossíveis e IDs duplicados", () => {
  deveFalhar(() => gerarPrimeiraRodada([{ id: "a", cabecaDeChave: 0 }, { id: "b" }]), "inválida");
  deveFalhar(() => gerarPrimeiraRodada([{ id: "a", cabecaDeChave: 1.5 }, { id: "b" }]), "inválida");
  deveFalhar(() => gerarPrimeiraRodada([{ id: "a", cabecaDeChave: 1 }, { id: "b", cabecaDeChave: 1 }]), "duplicadas");
  deveFalhar(() => gerarPrimeiraRodada([{ id: "a", cabecaDeChave: 3 }, { id: "b" }]), "impossível");
  deveFalhar(() => gerarPrimeiraRodada([{ id: "a" }, { id: "a" }]), "Participante duplicado");
});

test("classifica BYE, partida pronta e partida vazia corretamente", () => {
  const chave = new EliminacaoSimples().gerar([
    { id: "seed-1", cabecaDeChave: 1 },
    { id: "seed-2", cabecaDeChave: 2 },
    { id: "seed-3", cabecaDeChave: 3 },
    { id: "seed-4", cabecaDeChave: 4 },
    { id: "seed-5", cabecaDeChave: 5 },
  ]);
  assert.equal(chave.partidas.filter((partida) => partida.status === "bye").length, 3);
  assert.equal(chave.partidas.some((partida) => partida.status === "bye" && !partida.jogador1Id && !partida.jogador2Id), false);
  const chaveComVagas = new EliminacaoSimples().gerar(participantes(5));
  assert.equal(chaveComVagas.partidas.some((partida) => partida.status === "pendente" && !partida.jogador1Id && !partida.jogador2Id), true);
});
