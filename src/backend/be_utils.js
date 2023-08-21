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
    let clients = await wixData.query(BD_CLIENTE).find({suppressAuth: true});
    let transactions = await wixData.query(BD_TRANSACOES).eq("situacao", "aprovada").find({suppressAuth: true});

    let clients_total = clients.length;

    let total_abastecido_app =  transactions.items.reduce((total, item) => {
                                    return total + item.valor;
                                }, 0);

    let average_abastecimento = (total_abastecido_app/100)/transactions.length;

    let cashback_used = transactions.items.reduce((total, item) => {
                            if (item.tipo == "cashback")
                                return total + item.valorTipo;
                            return total;
                        }, 0);

    let cashback_to_be_used =   clients.items.reduce((total, item) => {
                                    return total + item.saldo;
                                }, 0);

    let total_paid =    transactions.items.reduce((total, item) => {
                            if (item.tipo == "cashback") // if is casback the total paid is the total of the transaction
                                return total + item.valor;
                            if (item.valor == item.valorTipo) // if is not 'cashback', check if the transaction is paid with ALL 'saldo'
                                return total;
                            return total + (item.valor + item.valorTipo); // if is not 'cashback' and the transaction is not paid with ALL 'saldo', the total paid is the total of the transaction minus the 'saldo' used (that is already negative)
                        }, 0);

    let dashboard_data = {
        clients_total: clients_total,
        average_abastecimento: average_abastecimento.toFixed(2),
        cashback_used: cashback_used,
        cashback_to_be_used: cashback_to_be_used,
        total_abastecido_app: total_abastecido_app,
        total_paid: total_paid,
    }

    return dashboard_data;
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