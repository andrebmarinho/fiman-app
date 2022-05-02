import http from './http-common';
import BaseService from './base.service';

class TransactionService extends BaseService {
    constructor() {
        super('/transactions');
    }

    get(page = 0, query = {}) {

        let path = `${this.prefix}?page=${page}`;
        
        if (query.description) {
            path += `&description=${query.description}`
        }

        if (query.reference) {
            path += `&reference=${query.reference}`
        }

        if (query.transactionDate) {
            path += `&transactionDate=${query.transactionDate}`
        }

        if (query.bankDescription) {
            path += `&bankDescription=${query.bankDescription}`
        }

        if (query.bankId) {
            path += `&bankId=${query.bankId}`
        }

        if (query.creditCardDescription) {
            path += `&creditCardDescription=${query.creditCardDescription}`
        }

        if (query.creditCardId) {
            path += `&creditCardId=${query.creditCardId}`
        }

        return http.get(path);
    }
}

export default new TransactionService();