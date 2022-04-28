import BaseService from './base.service';

class CategoryService extends BaseService {
    constructor(pieceData) {
        super('/categories')
    }
}

export default new CategoryService();