import 'axios';
import Axios from 'axios';
import { Http } from './http';

export class Auth {
    static isLoggedIn() {

    }

    static refreshToken(): Promise<any> {
        // TODO: Get refresh token from local storage
        let refreshToken = "";
        return new Promise((resolve, reject) => {
            Axios.post(
                Http.urlFor('/auth/refresh'),
                {
                    "refresh_token": refreshToken
                }
            )
        });
    }

    static doLogin(username: string, password: string): Promise<any> {
        return new Promise((resolve, reject) => {
            Axios.post(
                Http.urlFor('/auth/login'),
                {
                    "username": username,
                    "password": password
                }
            ).then((value) => {

            })
        })
    }
}
