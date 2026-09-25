import { RegraDeNegocioError } from "../../errors";
import type { ChaveamentoGerado, GeradorDeChaveamento, ParticipanteParaChaveamento } from "./tipos";

export class EliminacaoDupla implements GeradorDeChaveamento {
  gerar(participantes: ParticipanteParaChaveamento[]): ChaveamentoGerado {
    void participantes;
    throw new RegraDeNegocioError("Eliminação dupla ainda não foi implementada.");
  }
}
