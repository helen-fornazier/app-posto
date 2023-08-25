import wixData from 'wix-data';

export const BD_TRANSACOES = "transacoes";
export const BD_CLIENTE = "cliente";
export const BD_POSTOS = "postos";
export const BD_BOMBAS = "bombas";
export const BD_FUNCIONARIOS = "funcionarios";


// -------------- database query functions --------------------
export async function be_utils_get_history(member_id, transaction_status) {
    let [transacoes_p, postos_p] = await Promise.all([
        wixData.query(BD_TRANSACOES)
            .eq("clienteId", member_id)
            .eq("situacao", transaction_status)
            .find({suppressAuth: true}),
      
        wixData.query(BD_POSTOS)
            .find({suppressAuth: true})
    ]);

    let transacoes = transacoes_p.items;
    let postos = postos_p.items;

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

    // returns [{_id, data, tipo, db, nome, total}, ...]
    return hist;
}

export async function be_utils_get_bombas_code () {
    let [bombas_p, postos_p] = await Promise.all([
        wixData.query(BD_BOMBAS)
            .find({suppressAuth: true}),

        wixData.query(BD_POSTOS)
            .find({suppressAuth: true})
    ]);

    let bombas = bombas_p.items;
    let postos = postos_p.items;

    let possible_bombas = bombas;

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

    let transacoes_infos = await Promise.all(transacoes["items"].map(async (transacao) => {
        let cliente_nome = await be_utils_get_client_name(transacao.clienteId);
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
    let transacao = (await wixData.query(BD_TRANSACOES)
        .eq("_id", transaction_id)
        .find({suppressAuth: true}))["items"][0];

    let selected_transaction_information = {
        _id: transacao._id,
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

    // return [{tipo_combustivel, cod_bomba, data, hora, valor, is_cashback, saldo_usado, valor_a_pagar}]

    return selected_transaction_information;
}

export async function be_utils_get_posto_pct_cashback(posto_id) {
    let postos = await wixData.query(BD_POSTOS)
                        .eq("_id", posto_id)
                        .find({suppressAuth: true})

    let pct_cashback = postos["items"][0]["pctCashback"];
    
    return pct_cashback;
}

export async function be_utils_check_have_pending_transactions(cliente_id, transaction_status, transaction_status_update) {
    let transacoes = (await wixData.query(BD_TRANSACOES)
                    .eq("situacao", transaction_status)
                    .eq("clienteId", cliente_id)
                    .find({suppressAuth: true}))["items"];

    if (!transacoes["length"])
        console.log("Sem transacoes pendentes");
    else
        transacoes.forEach(transacao => be_utils_update_transaction(transacao._id, transaction_status_update));
    
    return;
}

export async function be_utils_get_client_name(cliente_id) {
    let cliente = (await get_client_infos(cliente_id))["items"][0];
    let cliente_firstName = cliente?.firstName ?? "";
    let cliente_lastName = cliente?.lastName ?? "";
    let cliente_nome = [cliente_firstName, cliente_lastName].filter(Boolean).join(' ');
    cliente_nome = cliente_nome ? cliente_nome : cliente.loginEmail;

    return cliente_nome;
}

export async function be_utils_get_dashboard_data() {
    let clients_query = wixData.aggregate(BD_CLIENTE)
    let transactions_query = wixData.aggregate(BD_TRANSACOES)

    let filter = wixData.filter().eq("situacao", "aprovada");
    let filter_cashback_used = wixData.filter().eq("situacao", "aprovada").eq("tipo", "pagamento_saldo");

    let [clients_count, total_abastecido_app, average_abastecimento, cashback_used, cashback_to_be_used] = await Promise.all([
        clients_query
            .count()
            .run()
            .then((results) => {
                return results.items[0].count;
            }),
        transactions_query
            .filter(filter)
            .sum("valor")
            .run()
            .then((results) => {
                return results.items[0].valorSum;
            }),
        transactions_query
            .filter(filter)
            .avg("valor")
            .run()
            .then((results) => {
                return results.items[0].valorAvg / 100;
            }),
        transactions_query
            .filter(filter_cashback_used)
            .sum("valorTipo")
            .run()
            .then((results) => {
                return -results.items[0].valorTipoSum
            }),
        clients_query
            .sum("saldo")
            .run()
            .then((results) => {
                return results.items[0].saldoSum
            }),
    ]);

    let total_paid = total_abastecido_app - cashback_used;

    let dashboard_data = {
        clients_total: clients_count,
        average_abastecimento: average_abastecimento.toFixed(2),
        cashback_used: cashback_used,
        cashback_to_be_used: cashback_to_be_used,
        total_abastecido_app: total_abastecido_app,
        total_paid: total_paid,
    }

    return dashboard_data;
}

export async function be_utils_graph_movimento() {
    const pageSize = 50;
    let transactions = [];
    let currentPage = 1;

    while (true) {
        const result = await wixData.query(BD_TRANSACOES)
            .limit(pageSize)
            .skip((currentPage - 1) * pageSize)
            .eq("situacao", "aprovada")
            .find();

        if (result.items.length === 0) {
            break;
        }

        transactions.push(...result.items);
        currentPage++;
    }

    let count = 0;
    let count_transactions_for_days = [];
    let selected_date = [format_day_to_compare(transactions[0]._createdDate), 1];
    count_transactions_for_days.push(selected_date);

    transactions.forEach(transaction => {
        let transaction_date = format_day_to_compare(new Date(transaction._createdDate))
        if (transaction_date == count_transactions_for_days[count][0]){
            count_transactions_for_days[count][1] += 1;
        }
        else{
            selected_date = [format_day_to_compare(transaction._createdDate), 1];
            count_transactions_for_days.push(selected_date)
            count++;
        }
    });

    count_transactions_for_days.map((item, index) => {
        let date = new Date(item[0]).getTime();
        count_transactions_for_days[index][0] = date;
    })

    return count_transactions_for_days;
}


// -------------- database insert functions --------------------
export async function be_utils_cadastrar_transacao(transacao) {
    return (await wixData.insert(BD_TRANSACOES, transacao))._id;
}

export async function be_utils_cadastrar_cliente(cliente) {
    let cliente_on_database = await get_client_saldo(cliente._id);
    if (cliente_on_database["length"])
        return cliente_on_database["items"][0];

    let cliente_db = {
        _id: cliente._id,
        saldo: 0
    }

    await wixData.insert(BD_CLIENTE, cliente_db)
}


export async function be_utils_check_is_funcionario(funcionario_email) {
    let funcionarios = await wixData.query(BD_FUNCIONARIOS)
                            .eq("email", funcionario_email)
                            .find({suppressAuth: true})
    
    let is_funcionario = funcionarios["items"]["length"] ? true : false;
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
}

async function get_client_infos(cliente_id) {
    return await wixData.query("Members/FullData")
                .eq("_id", cliente_id)
                .find({suppressAuth: true})
}

async function get_transaction_infos(transaction_id) {
    let transacao = (await wixData.query(BD_TRANSACOES)
        .eq("_id", transaction_id)
        .find({suppressAuth: true}))["items"][0];
    
    return transacao;
}

function format_day_to_compare(date) {
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();

    return `${year}-${month}-${day}`
}