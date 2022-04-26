import BaseService from './base.service';

class CategoryService extends BaseService {
    constructor() {
        super('/categories');
    }
}

export default new CategoryService();