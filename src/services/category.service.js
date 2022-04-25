import http from "../http-common";

const prefix = '/categories';

class CategoryService {
    get(page = 0, description) {
        return http.get(`${prefix}?description=${description}&page=${page}`);
    }

    getById(id) {
        return http.get(`${prefix}/id/${id}`);
    }

    create(data) {
        return http.post(prefix, data);
    }

    update(data) {
        return http.put(prefix, data);
    }

    delete(id, userId) {
        return http.delete(`${prefix}/?id=${id}`, { data: { user_id: userId} });
    }
}

export default new RestaurantDataService();