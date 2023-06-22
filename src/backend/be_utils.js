const BD_TRANSACAO = "";

const json_test = {
        "_id": "1",
        "data": "Thu Jun 21 2023 09:54:51 GMT-0300",
        "tipo": "cashback",
        "db": "15,60",
        "nome": "Posto Machado"
}

const json_test2 = {
    "_id": "2",
    "data": "Thu Jun 22 2023 09:54:51 GMT-0300",
    "tipo": "pagamento_cartao",
    "db": "242,50",
    "nome": "Posto Campestre"
}

const json_test3 = {
    "_id": "3",
    "data": "Thu Jun 23 2023 09:54:51 GMT-0300",
    "tipo": "pagamento_dinheiro",
    "db": "150,00",
    "nome": "Posto Caldas"
}

// TODO: add the logic to catch all information from database
// and remove all 'json_test'
export async function be_utils_get_history() {
    let hist = [];
    hist.push(json_test);
    hist.push(json_test2);
    hist.push(json_test3);
    return hist;
}
