import http from './http-common';

let prefix = '';

export default class BaseService {
    constructor(customPrefix) {
        prefix = customPrefix;
    }

    get(page = 0, description = null) {
        let path = `${prefix}?page=${page}`;
        if (description) {
            path += `&description=${description}`
        }

        return http.get(path);
    }

    getById(id) {
        return http.get(`${prefix}/${id}`);
    }

    create(data) {
        return http.post(prefix, data);
    }

    update(id, data) {
        return http.put(`${prefix}/${id}`, data);
    }

    delete(id, userId) {
        return http.delete(`${prefix}/${id}`, { data: { user_id: userId} });
    }
}
