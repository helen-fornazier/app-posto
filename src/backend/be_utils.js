const BD_TRANSACAO = "";

const hist_filter_transaction = ["cashback", "pagamento"];
const hist_filter_period = {"semana": 7, "quinzena": 15, "mes": 30, "trimestre": 90};

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

const json_test4 = {
    "_id": "4",
    "data": "Thu Jun 19 2023 09:54:51 GMT-0300",
    "tipo": "pagamento_saldo",
    "db": "46,00",
    "nome": "Posto Bandeira"
}

const json_test5 = {
    "_id": "5",
    "data": "Thu Jun 10 2023 09:54:51 GMT-0300",
    "tipo": "pagamento_saldo",
    "db": "74,00",
    "nome": "Posto Caconde"
}

// TODO: add the logic to catch all information from database
// and remove all 'json_test'
export async function be_utils_get_history(_filter) {
    let hist = [];
    hist.push(json_test);
    hist.push(json_test2);
    hist.push(json_test3);
    hist.push(json_test4);
    hist.push(json_test5);
    const _filter_date = _filter["date"]
    const filter_transaction = _filter["transaction"]


    if (hist_filter_transaction.includes(filter_transaction)){
        // TODO: It's not necessary change the condition, just
        // add the filter catching the informations from database
        // and filter by '_filter["transaction"]'.
        hist = hist.filter((value) => value.tipo.includes(filter_transaction));
    }
    
    if (Object.keys(hist_filter_period).includes(_filter_date)){
        // TODO: It's not necessary change the condition, just
        // add the filter catching the informations from database
        // and filter by '_filter["date"]'.
        const now = new Date();
        let period_of_time = hist_filter_period[_filter_date];

        hist = hist.filter((value) => {
            const item_time = new Date(value.data);
            if (now.getDate() - item_time.getDate() <= period_of_time)
                return value;
        })

    }

    return hist;
}
