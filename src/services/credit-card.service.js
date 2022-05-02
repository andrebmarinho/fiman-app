import BaseService from './base.service';

class CreditCardService extends BaseService {
    constructor() {
        super('/credit-cards');
    }
}

export default new CreditCardService();