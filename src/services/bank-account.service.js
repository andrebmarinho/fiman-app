import BaseService from './base.service';

class BankAccountService extends BaseService {
    constructor() {
        super('/bank-accounts');
    }
}

export default new BankAccountService();