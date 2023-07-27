import wixData from 'wix-data';

export const BD_TRANSACOES = "transacoes";
export const BD_CLIENTE = "cliente";
export const BD_POSTOS = "postos";
export const BD_BOMBAS = "bombas";
export const BD_FUNCIONARIOS = "funcionarios";

const hist_filter_transaction = ["cashback", "pagamento"];
const hist_filter_period = {"semana": 7, "quinzena": 15, "mes": 30, "trimestre": 90};


// -------------- database query functions --------------------
export async function be_utils_get_history(_filter, member_id, transaction_status) {
    const _filter_date = _filter["date"]
    const filter_transaction = _filter["transaction"]

    let transacoes = await wixData.query(BD_TRANSACOES)
                            .eq("clienteId", member_id)
                            .eq("situacao", transaction_status)
                            .find({suppressAuth: true})
                            .then((results) => {
                                return results["items"];
                            })

    let postos = await wixData.query(BD_POSTOS)
                        .find({suppressAuth: true})
                        .then((results) => {
                            return results["items"];
                        })

    let hist = transacoes.map((transacao) => {
        let posto = postos.find(posto => posto._id === transacao.postoId);
        return {
            "_id": transacao._id,
            "data": transacao._createdDate,
            "tipo": transacao.tipo,
            "db": transacao.valorTipo,
            "nome": posto.nome,
            "total": transacao.valor
        };
    });

    if (!_filter)
        return hist;


    if (hist_filter_transaction.includes(filter_transaction)){
        hist = hist.filter((value) => value.tipo.includes(filter_transaction));
    }
    
    if (Object.keys(hist_filter_period).includes(_filter_date)){
        const now = new Date();
        let period_of_time = hist_filter_period[_filter_date];

        hist = hist.filter((value) => {
            const item_time = new Date(value.data);
            let time_diff = Math.abs((now.getTime() - item_time.getTime())/(1000*60*60*24)); // converting miliseconds to days
            if (time_diff <= period_of_time)
                return value;
        })

    }
    
    // returns [{_id, data, tipo, db, nome, total}, ...]
    return hist;
}

export async function be_utils_get_bombas_code (code_bomba) {
    let bombas = await wixData.query(BD_BOMBAS).find({suppressAuth: true})
                        .then((results) => {
                            return results["items"];
                        })
    let postos = await wixData.query(BD_POSTOS).find({suppressAuth: true})
                        .then((results) => {
                            return results["items"];
                        })

    let possible_bombas = bombas.filter(bomba => {
        return !Array.from(code_bomba).some((char, i) => {
            return char !== '-' && char !== bomba.codBomba[i];
        });
    });

    let posto_and_bomba_informations = possible_bombas.map(bomba => {
        let posto = postos.find(posto => posto._id === bomba.postoId);
        return {...bomba,
                cod_e_posto: bomba.codBomba + " - " + posto.nome,
                img_posto: posto.imgLogo ? posto.imgLogo : "",
                endereco_posto: posto.endereco ? posto.endereco : ""
            };
    });

    // returns [{_id, postoId, codBomba, cod_e_posto, img_posto, endereco_posto}]
    return posto_and_bomba_informations;
}

export async function be_utils_get_saldo(cliente_id) {
    let saldo = (await get_client_saldo(cliente_id))["items"][0]["saldo"];

    return saldo;
}

export async function be_utils_get_pending_transactions(transaction_status) {
    let transacoes = await wixData.query(BD_TRANSACOES)
                            .eq("situacao", transaction_status)
                            .find({suppressAuth: true})
                            .then((results) => {
                                return results["items"];
                            });
    
    let transacoes_infos = await Promise.all(transacoes.map(async (transacao) => {
        let cliente_nome = await get_client_name(transacao.clienteId);
        return {
            "_id": transacao._id,
            "client_name": cliente_nome,
            "cod_bomba": transacao.codBomba,
            "data": transacao._createdDate,
            "valor_a_pagar": transacao.tipo == "cashback" ? transacao.valor : transacao.valor + transacao.valorTipo,
        };
    }));

    // return [{client_name, cod_bomba, data, valor_a_pagar}, ...]
    return transacoes_infos;
}

export async function be_utils_get_transaction_detail(transaction_id) {
    let transacao = await wixData.query(BD_TRANSACOES)
        .eq("_id", transaction_id)
        .find({suppressAuth: true})
        .then((results) => {
            return results["items"][0];
    })
    let cliente_nome = await get_client_name(transacao.clienteId);

    let selected_transaction_information = {
        _id: transacao._id,
        nome: cliente_nome,
        tipo_combustivel: transacao.tipoCombustivel,
        cod_bomba: transacao.codBomba,
        data: transacao._createdDate,
        valor: transacao.valor,
        is_cashback: transacao.tipo == "cashback" ? true : false,
        saldo_usado: transacao.tipo == "cashback" ? 0 : transacao.valorTipo,
        valor_a_pagar: transacao.tipo == "cashback" ? transacao.valor : transacao.valor + transacao.valorTipo,
        situacao: transacao.situacao,
        cliente_id: transacao.clienteId,
    }

    // return [{nome, tipo_combustivel, cod_bomba, data, hora, valor, is_cashback, saldo_usado, valor_a_pagar}]

    return selected_transaction_information;
}

export async function be_utils_get_posto_pct_cashback(posto_id) {
    let postos = await wixData.query(BD_POSTOS)
                        .eq("_id", posto_id)
                        .find({suppressAuth: true})
                        .then((results) => {
                            return results["items"];
                        })
    let pct_cashback = postos[0]["pctCashback"];
    
    return pct_cashback;
}

export async function be_utils_check_have_pending_transactions(cliente_id, transaction_status, transaction_status_update) {
    let transacoes = await wixData.query(BD_TRANSACOES)
                    .eq("situacao", transaction_status)
                    .eq("clienteId", cliente_id)
                    .find({suppressAuth: true})
                    .then((results) => {
                        return results["items"];
                    });
    if (!transacoes["length"])
        console.log("Sem transacoes pendentes");
    else
        transacoes.forEach(transacao => be_utils_update_transaction(transacao._id, transaction_status_update));
    
    return;
}


// -------------- database insert functions --------------------
export async function be_utils_cadastrar_transacao(transacao) {
    return wixData.insert(BD_TRANSACOES, transacao)
    .then((result) => {
        const itemInserido = result;
        return result._id;
    })
    .catch((error) => {
        console.error(error);
    });

}

export async function be_utils_cadastrar_cliente(cliente) {
    let cliente_on_database = await get_client_saldo(cliente._id);
    if (cliente_on_database["length"])
        return cliente_on_database["items"][0];
    else{
        let cliente_db = {
            _id: cliente._id,
            saldo: 0
        }
        await wixData.insert(BD_CLIENTE, cliente_db)
        .then((result) => {
            const itemInserido = result;
        })
        .catch((error) => {
            console.error(error);
        });
    }
    
    return
}


export async function be_utils_check_is_funcionario(funcionario_email) {
    let funcionarios = await wixData.query(BD_FUNCIONARIOS)
                            .eq("email", funcionario_email)
                            .find({suppressAuth: true})
                            .then((results) => {
                                return results["items"];
                            });
    let is_funcionario = funcionarios["length"] ? true : false;
    return is_funcionario;
}

// -------------- database update functions --------------------
export async function be_utils_update_transaction(transaction_id, transaction_status) {
    //transaction_status = "aprovada" || "recusada" || "expirada"
    const item = await wixData.get(BD_TRANSACOES, transaction_id);
    item.situacao = transaction_status;

    await wixData.update(BD_TRANSACOES, item);

    return true;
}

export async function be_utils_update_client_saldo(cliente_id, transaction_id) {
    console.log("ATUALIZANDO SALDO DO CLIENTE");
    let valor_tipo = (await get_transaction_infos(transaction_id)).valorTipo;
    const item = await wixData.get(BD_CLIENTE, cliente_id);
    item.saldo += valor_tipo;
    
    await wixData.update(BD_CLIENTE, item);
}


// -------------- internal functions --------------------
async function get_client_saldo(cliente_id) {
    return await wixData.query(BD_CLIENTE)
                .eq("_id", cliente_id)
                .find({suppressAuth: true})
                .then((results) => {
                    return results;
                })
}

async function get_client_infos(cliente_id) {
    return await wixData.query("Members/FullData")
                .eq("_id", cliente_id)
                .find({suppressAuth: true})
                .then((results) => {
                    return results;
                })
}

async function get_client_name(cliente_id) {
    let cliente = (await get_client_infos(cliente_id))["items"][0];
    let cliente_firstName = cliente?.firstName ?? "";
    let cliente_lastName = cliente?.lastName ?? "";
    let cliente_nome = [cliente_firstName, cliente_lastName].filter(Boolean).join(' ');
    cliente_nome = cliente_nome ? cliente_nome : cliente.loginEmail;

    return cliente_nome;
}

async function get_transaction_infos(transaction_id) {
    let transacao = await wixData.query(BD_TRANSACOES)
        .eq("_id", transaction_id)
        .find({suppressAuth: true})
        .then((results) => {
            return results["items"][0];
        });
    
    return transacao;
}