// tslint:disable
/// <reference path="./custom.d.ts" />
/**
 * NERd
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * OpenAPI spec version: 1.0.0
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


import * as url from "url";
import { Configuration } from "./configuration";
import globalAxios, { AxiosPromise, AxiosInstance } from 'axios';

const BASE_PATH = "http://localhost:3000".replace(/\/+$/, "");

/**
 *
 * @export
 */
export const COLLECTION_FORMATS = {
    csv: ",",
    ssv: " ",
    tsv: "\t",
    pipes: "|",
};

/**
 *
 * @export
 * @interface RequestArgs
 */
export interface RequestArgs {
    url: string;
    options: any;
}

/**
 *
 * @export
 * @class BaseAPI
 */
export class BaseAPI {
    protected configuration: Configuration | undefined;

    constructor(configuration?: Configuration, protected basePath: string = BASE_PATH, protected axios: AxiosInstance = globalAxios) {
        if (configuration) {
            this.configuration = configuration;
            this.basePath = configuration.basePath || this.basePath;
        }
    }
};

/**
 *
 * @export
 * @class RequiredError
 * @extends {Error}
 */
export class RequiredError extends Error {
    name: "RequiredError" = "RequiredError";
    constructor(public field: string, msg?: string) {
        super(msg);
    }
}

/**
 *
 * @export
 * @interface HttpError
 */
export interface HttpError {
    /**
     * A description of the error
     * @type {string}
     * @memberof HttpError
     */
    status: string;
}

/**
 *
 * @export
 * @interface NERdCorpus
 */
export interface NERdCorpus {
    /**
     *
     * @type {string}
     * @memberof NERdCorpus
     */
    _cls?: string;
    /**
     *
     * @type {Array<Nested>}
     * @memberof NERdCorpus
     */
    dataset?: Array<Nested>;
    /**
     *
     * @type {string}
     * @memberof NERdCorpus
     */
    name: string;
    /**
     *
     * @type {string}
     * @memberof NERdCorpus
     */
    types?: string;
    /**
     *
     * @type {string}
     * @memberof NERdCorpus
     */
    parent?: string;
    /**
     *
     * @type {string}
     * @memberof NERdCorpus
     */
    id?: string;
}

/**
 *
 * @export
 * @interface Nested
 */
export interface Nested {
    /**
     *
     * @type {Array<Nested>}
     * @memberof Nested
     */
    trained?: Array<Nested>;
    /**
     *
     * @type {string}
     * @memberof Nested
     */
    original_text?: string;
}

/**
 *
 * @export
 * @interface RefreshToken
 */
export interface RefreshToken {
    /**
     *
     * @type {string}
     * @memberof RefreshToken
     */
    grant_type?: string;
    /**
     *
     * @type {string}
     * @memberof RefreshToken
     */
    refresh_token?: string;
}

/**
 *
 * @export
 * @interface Register
 */
export interface Register {
    /**
     *
     * @type {string}
     * @memberof Register
     */
    email: string;
    /**
     *
     * @type {string}
     * @memberof Register
     */
    name?: string;
    /**
     *
     * @type {string}
     * @memberof Register
     */
    plain_password?: string;
}

/**
 *
 * @export
 * @interface SystemCorpus
 */
export interface SystemCorpus {
    /**
     *
     * @type {string}
     * @memberof SystemCorpus
     */
    spacy_model?: string;
    /**
     *
     * @type {string}
     * @memberof SystemCorpus
     */
    _cls?: string;
    /**
     *
     * @type {string}
     * @memberof SystemCorpus
     */
    name: string;
    /**
     *
     * @type {string}
     * @memberof SystemCorpus
     */
    types?: string;
    /**
     *
     * @type {string}
     * @memberof SystemCorpus
     */
    id?: string;
}

/**
 *
 * @export
 * @interface Token
 */
export interface Token {
    /**
     *
     * @type {string}
     * @memberof Token
     */
    grant_type?: string;
    /**
     *
     * @type {string}
     * @memberof Token
     */
    username?: string;
    /**
     *
     * @type {string}
     * @memberof Token
     */
    password?: string;
}

/**
 *
 * @export
 * @interface User
 */
export interface User {
    /**
     *
     * @type {string}
     * @memberof User
     */
    email: string;
    /**
     *
     * @type {string}
     * @memberof User
     */
    name?: string;
    /**
     *
     * @type {Array<string>}
     * @memberof User
     */
    roles?: Array<string>;
}

/**
 *
 * @export
 * @interface UserCredentials
 */
export interface UserCredentials {
    /**
     * A temporary JWT
     * @type {string}
     * @memberof UserCredentials
     */
    access_token: string;
    /**
     * A refresh token
     * @type {string}
     * @memberof UserCredentials
     */
    refresh_token: string;
    /**
     *
     * @type {Array<string>}
     * @memberof UserCredentials
     */
    roles?: Array<string>;
}

/**
 *
 * @export
 * @interface UserPayload
 */
export interface UserPayload {
    /**
     *
     * @type {string}
     * @memberof UserPayload
     */
    email: string;
    /**
     *
     * @type {string}
     * @memberof UserPayload
     */
    name?: string;
    /**
     *
     * @type {Array<string>}
     * @memberof UserPayload
     */
    roles?: Array<string>;
    /**
     *
     * @type {string}
     * @memberof UserPayload
     */
    plain_password?: string;
}


/**
 * AuthApi - axios parameter creator
 * @export
 */
export const AuthApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         *
         * @summary Generate new access and refresh tokens with password grant_type
         * @param {Token} token
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createAccessToken(token: Token, options: any = {}): RequestArgs {
            // verify required parameter 'token' is not null or undefined
            if (token === null || token === undefined) {
                throw new RequiredError('token','Required parameter token was null or undefined when calling createAccessToken.');
            }
            const localVarPath = `/api/auth/token`;
            const localVarUrlObj = url.parse(localVarPath, true);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign({ method: 'POST' }, baseOptions, options);
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            localVarHeaderParameter['Content-Type'] = 'application/json';

            localVarUrlObj.query = Object.assign({}, localVarUrlObj.query, localVarQueryParameter, options.query);
            // fix override query string Detail: https://stackoverflow.com/a/7517673/1077943
            delete localVarUrlObj.search;
            localVarRequestOptions.headers = Object.assign({}, localVarHeaderParameter, options.headers);
            const needsSerialization = (<any>"Token" !== "string") || localVarRequestOptions.headers['Content-Type'] === 'application/json';
            localVarRequestOptions.data =  needsSerialization ? JSON.stringify(token || {}) : (token || "");

            return {
                url: url.format(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         *
         * @summary Refresh access token
         * @param {RefreshToken} refresh_token
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        refreshAccessToken(refresh_token: RefreshToken, options: any = {}): RequestArgs {
            // verify required parameter 'refresh_token' is not null or undefined
            if (refresh_token === null || refresh_token === undefined) {
                throw new RequiredError('refresh_token','Required parameter refresh_token was null or undefined when calling refreshAccessToken.');
            }
            const localVarPath = `/api/auth/refresh`;
            const localVarUrlObj = url.parse(localVarPath, true);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign({ method: 'POST' }, baseOptions, options);
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            localVarHeaderParameter['Content-Type'] = 'application/json';

            localVarUrlObj.query = Object.assign({}, localVarUrlObj.query, localVarQueryParameter, options.query);
            // fix override query string Detail: https://stackoverflow.com/a/7517673/1077943
            delete localVarUrlObj.search;
            localVarRequestOptions.headers = Object.assign({}, localVarHeaderParameter, options.headers);
            const needsSerialization = (<any>"RefreshToken" !== "string") || localVarRequestOptions.headers['Content-Type'] === 'application/json';
            localVarRequestOptions.data =  needsSerialization ? JSON.stringify(refresh_token || {}) : (refresh_token || "");

            return {
                url: url.format(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * Returns user credentials to skip login on register
         * @summary Register a new user
         * @param {Register} register
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        registerUser(register: Register, options: any = {}): RequestArgs {
            // verify required parameter 'register' is not null or undefined
            if (register === null || register === undefined) {
                throw new RequiredError('register','Required parameter register was null or undefined when calling registerUser.');
            }
            const localVarPath = `/api/auth/register`;
            const localVarUrlObj = url.parse(localVarPath, true);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign({ method: 'POST' }, baseOptions, options);
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            localVarHeaderParameter['Content-Type'] = 'application/json';

            localVarUrlObj.query = Object.assign({}, localVarUrlObj.query, localVarQueryParameter, options.query);
            // fix override query string Detail: https://stackoverflow.com/a/7517673/1077943
            delete localVarUrlObj.search;
            localVarRequestOptions.headers = Object.assign({}, localVarHeaderParameter, options.headers);
            const needsSerialization = (<any>"Register" !== "string") || localVarRequestOptions.headers['Content-Type'] === 'application/json';
            localVarRequestOptions.data =  needsSerialization ? JSON.stringify(register || {}) : (register || "");

            return {
                url: url.format(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
    }
};

/**
 * AuthApi - functional programming interface
 * @export
 */
export const AuthApiFp = function(configuration?: Configuration) {
    return {
        /**
         *
         * @summary Generate new access and refresh tokens with password grant_type
         * @param {Token} token
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createAccessToken(token: Token, options?: any): (axios?: AxiosInstance, basePath?: string) => AxiosPromise<UserCredentials> {
            const localVarAxiosArgs = AuthApiAxiosParamCreator(configuration).createAccessToken(token, options);
            return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
                const axiosRequestArgs = Object.assign(localVarAxiosArgs.options, {url: basePath + localVarAxiosArgs.url})
                return axios.request(axiosRequestArgs);
            };
        },
        /**
         *
         * @summary Refresh access token
         * @param {RefreshToken} refresh_token
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        refreshAccessToken(refresh_token: RefreshToken, options?: any): (axios?: AxiosInstance, basePath?: string) => AxiosPromise<UserCredentials> {
            const localVarAxiosArgs = AuthApiAxiosParamCreator(configuration).refreshAccessToken(refresh_token, options);
            return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
                const axiosRequestArgs = Object.assign(localVarAxiosArgs.options, {url: basePath + localVarAxiosArgs.url})
                return axios.request(axiosRequestArgs);
            };
        },
        /**
         * Returns user credentials to skip login on register
         * @summary Register a new user
         * @param {Register} register
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        registerUser(register: Register, options?: any): (axios?: AxiosInstance, basePath?: string) => AxiosPromise<UserCredentials> {
            const localVarAxiosArgs = AuthApiAxiosParamCreator(configuration).registerUser(register, options);
            return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
                const axiosRequestArgs = Object.assign(localVarAxiosArgs.options, {url: basePath + localVarAxiosArgs.url})
                return axios.request(axiosRequestArgs);
            };
        },
    }
};

/**
 * AuthApi - factory interface
 * @export
 */
export const AuthApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    return {
        /**
         *
         * @summary Generate new access and refresh tokens with password grant_type
         * @param {Token} token
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createAccessToken(token: Token, options?: any) {
            return AuthApiFp(configuration).createAccessToken(token, options)(axios, basePath);
        },
        /**
         *
         * @summary Refresh access token
         * @param {RefreshToken} refresh_token
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        refreshAccessToken(refresh_token: RefreshToken, options?: any) {
            return AuthApiFp(configuration).refreshAccessToken(refresh_token, options)(axios, basePath);
        },
        /**
         * Returns user credentials to skip login on register
         * @summary Register a new user
         * @param {Register} register
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        registerUser(register: Register, options?: any) {
            return AuthApiFp(configuration).registerUser(register, options)(axios, basePath);
        },
    };
};

/**
 * AuthApi - object-oriented interface
 * @export
 * @class AuthApi
 * @extends {BaseAPI}
 */
export class AuthApi extends BaseAPI {
    /**
     *
     * @summary Generate new access and refresh tokens with password grant_type
     * @param {Token} token
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthApi
     */
    public createAccessToken(token: Token, options?: any) {
        return AuthApiFp(this.configuration).createAccessToken(token, options)(this.axios, this.basePath);
    }

    /**
     *
     * @summary Refresh access token
     * @param {RefreshToken} refresh_token
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthApi
     */
    public refreshAccessToken(refresh_token: RefreshToken, options?: any) {
        return AuthApiFp(this.configuration).refreshAccessToken(refresh_token, options)(this.axios, this.basePath);
    }

    /**
     * Returns user credentials to skip login on register
     * @summary Register a new user
     * @param {Register} register
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof AuthApi
     */
    public registerUser(register: Register, options?: any) {
        return AuthApiFp(this.configuration).registerUser(register, options)(this.axios, this.basePath);
    }

}

/**
 * CorporaApi - axios parameter creator
 * @export
 */
export const CorporaApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         *
         * @summary List available corpora
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listCorpora(options: any = {}): RequestArgs {
            const localVarPath = `/api/corpora`;
            const localVarUrlObj = url.parse(localVarPath, true);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign({ method: 'GET' }, baseOptions, options);
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication oAuth2Password required
            // oauth required
            if (configuration && configuration.accessToken) {
				const localVarAccessTokenValue = typeof configuration.accessToken === 'function'
					? configuration.accessToken("oAuth2Password", ["user", "admin"])
					: configuration.accessToken;
                localVarHeaderParameter["Authorization"] = "Bearer " + localVarAccessTokenValue;
            }

            localVarUrlObj.query = Object.assign({}, localVarUrlObj.query, localVarQueryParameter, options.query);
            // fix override query string Detail: https://stackoverflow.com/a/7517673/1077943
            delete localVarUrlObj.search;
            localVarRequestOptions.headers = Object.assign({}, localVarHeaderParameter, options.headers);

            return {
                url: url.format(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         *
         * @summary List available SpaCy base corpus
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listSystemCorpora(options: any = {}): RequestArgs {
            const localVarPath = `/api/corpora/system`;
            const localVarUrlObj = url.parse(localVarPath, true);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign({ method: 'GET' }, baseOptions, options);
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication oAuth2Password required
            // oauth required
            if (configuration && configuration.accessToken) {
				const localVarAccessTokenValue = typeof configuration.accessToken === 'function'
					? configuration.accessToken("oAuth2Password", ["user", "admin"])
					: configuration.accessToken;
                localVarHeaderParameter["Authorization"] = "Bearer " + localVarAccessTokenValue;
            }

            localVarUrlObj.query = Object.assign({}, localVarUrlObj.query, localVarQueryParameter, options.query);
            // fix override query string Detail: https://stackoverflow.com/a/7517673/1077943
            delete localVarUrlObj.search;
            localVarRequestOptions.headers = Object.assign({}, localVarHeaderParameter, options.headers);

            return {
                url: url.format(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
    }
};

/**
 * CorporaApi - functional programming interface
 * @export
 */
export const CorporaApiFp = function(configuration?: Configuration) {
    return {
        /**
         *
         * @summary List available corpora
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listCorpora(options?: any): (axios?: AxiosInstance, basePath?: string) => AxiosPromise<Array<NERdCorpus>> {
            const localVarAxiosArgs = CorporaApiAxiosParamCreator(configuration).listCorpora(options);
            return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
                const axiosRequestArgs = Object.assign(localVarAxiosArgs.options, {url: basePath + localVarAxiosArgs.url})
                return axios.request(axiosRequestArgs);
            };
        },
        /**
         *
         * @summary List available SpaCy base corpus
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listSystemCorpora(options?: any): (axios?: AxiosInstance, basePath?: string) => AxiosPromise<Array<SystemCorpus>> {
            const localVarAxiosArgs = CorporaApiAxiosParamCreator(configuration).listSystemCorpora(options);
            return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
                const axiosRequestArgs = Object.assign(localVarAxiosArgs.options, {url: basePath + localVarAxiosArgs.url})
                return axios.request(axiosRequestArgs);
            };
        },
    }
};

/**
 * CorporaApi - factory interface
 * @export
 */
export const CorporaApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    return {
        /**
         *
         * @summary List available corpora
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listCorpora(options?: any) {
            return CorporaApiFp(configuration).listCorpora(options)(axios, basePath);
        },
        /**
         *
         * @summary List available SpaCy base corpus
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listSystemCorpora(options?: any) {
            return CorporaApiFp(configuration).listSystemCorpora(options)(axios, basePath);
        },
    };
};

/**
 * CorporaApi - object-oriented interface
 * @export
 * @class CorporaApi
 * @extends {BaseAPI}
 */
export class CorporaApi extends BaseAPI {
    /**
     *
     * @summary List available corpora
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof CorporaApi
     */
    public listCorpora(options?: any) {
        return CorporaApiFp(this.configuration).listCorpora(options)(this.axios, this.basePath);
    }

    /**
     *
     * @summary List available SpaCy base corpus
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof CorporaApi
     */
    public listSystemCorpora(options?: any) {
        return CorporaApiFp(this.configuration).listSystemCorpora(options)(this.axios, this.basePath);
    }

}

/**
 * UsersApi - axios parameter creator
 * @export
 */
export const UsersApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         *
         * @summary Returns a list of existing users
         * @param {number} [page]
         * @param {number} [page_size]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listUsers(page?: number, page_size?: number, options: any = {}): RequestArgs {
            const localVarPath = `/api/users/`;
            const localVarUrlObj = url.parse(localVarPath, true);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign({ method: 'GET' }, baseOptions, options);
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication oAuth2Password required
            // oauth required
            if (configuration && configuration.accessToken) {
				const localVarAccessTokenValue = typeof configuration.accessToken === 'function'
					? configuration.accessToken("oAuth2Password", ["user", "admin"])
					: configuration.accessToken;
                localVarHeaderParameter["Authorization"] = "Bearer " + localVarAccessTokenValue;
            }

            if (page !== undefined) {
                localVarQueryParameter['page'] = page;
            }

            if (page_size !== undefined) {
                localVarQueryParameter['page_size'] = page_size;
            }

            localVarUrlObj.query = Object.assign({}, localVarUrlObj.query, localVarQueryParameter, options.query);
            // fix override query string Detail: https://stackoverflow.com/a/7517673/1077943
            delete localVarUrlObj.search;
            localVarRequestOptions.headers = Object.assign({}, localVarHeaderParameter, options.headers);

            return {
                url: url.format(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         *
         * @summary Patches the user entity
         * @param {string} user_email
         * @param {UserPayload} user_payload
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        updateUser(user_email: string, user_payload: UserPayload, options: any = {}): RequestArgs {
            // verify required parameter 'user_email' is not null or undefined
            if (user_email === null || user_email === undefined) {
                throw new RequiredError('user_email','Required parameter user_email was null or undefined when calling updateUser.');
            }
            // verify required parameter 'user_payload' is not null or undefined
            if (user_payload === null || user_payload === undefined) {
                throw new RequiredError('user_payload','Required parameter user_payload was null or undefined when calling updateUser.');
            }
            const localVarPath = `/api/users/{user_email}`
                .replace(`{${"user_email"}}`, encodeURIComponent(String(user_email)));
            const localVarUrlObj = url.parse(localVarPath, true);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign({ method: 'PATCH' }, baseOptions, options);
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication oAuth2Password required
            // oauth required
            if (configuration && configuration.accessToken) {
				const localVarAccessTokenValue = typeof configuration.accessToken === 'function'
					? configuration.accessToken("oAuth2Password", ["user", "admin"])
					: configuration.accessToken;
                localVarHeaderParameter["Authorization"] = "Bearer " + localVarAccessTokenValue;
            }

            localVarHeaderParameter['Content-Type'] = 'application/json';

            localVarUrlObj.query = Object.assign({}, localVarUrlObj.query, localVarQueryParameter, options.query);
            // fix override query string Detail: https://stackoverflow.com/a/7517673/1077943
            delete localVarUrlObj.search;
            localVarRequestOptions.headers = Object.assign({}, localVarHeaderParameter, options.headers);
            const needsSerialization = (<any>"UserPayload" !== "string") || localVarRequestOptions.headers['Content-Type'] === 'application/json';
            localVarRequestOptions.data =  needsSerialization ? JSON.stringify(user_payload || {}) : (user_payload || "");

            return {
                url: url.format(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         *
         * @summary Gets user entity by email
         * @param {string} user_email
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        userDetails(user_email: string, options: any = {}): RequestArgs {
            // verify required parameter 'user_email' is not null or undefined
            if (user_email === null || user_email === undefined) {
                throw new RequiredError('user_email','Required parameter user_email was null or undefined when calling userDetails.');
            }
            const localVarPath = `/api/users/{user_email}`
                .replace(`{${"user_email"}}`, encodeURIComponent(String(user_email)));
            const localVarUrlObj = url.parse(localVarPath, true);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign({ method: 'GET' }, baseOptions, options);
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            // authentication oAuth2Password required
            // oauth required
            if (configuration && configuration.accessToken) {
				const localVarAccessTokenValue = typeof configuration.accessToken === 'function'
					? configuration.accessToken("oAuth2Password", ["user", "admin"])
					: configuration.accessToken;
                localVarHeaderParameter["Authorization"] = "Bearer " + localVarAccessTokenValue;
            }

            localVarUrlObj.query = Object.assign({}, localVarUrlObj.query, localVarQueryParameter, options.query);
            // fix override query string Detail: https://stackoverflow.com/a/7517673/1077943
            delete localVarUrlObj.search;
            localVarRequestOptions.headers = Object.assign({}, localVarHeaderParameter, options.headers);

            return {
                url: url.format(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
    }
};

/**
 * UsersApi - functional programming interface
 * @export
 */
export const UsersApiFp = function(configuration?: Configuration) {
    return {
        /**
         *
         * @summary Returns a list of existing users
         * @param {number} [page]
         * @param {number} [page_size]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listUsers(page?: number, page_size?: number, options?: any): (axios?: AxiosInstance, basePath?: string) => AxiosPromise<Array<User>> {
            const localVarAxiosArgs = UsersApiAxiosParamCreator(configuration).listUsers(page, page_size, options);
            return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
                const axiosRequestArgs = Object.assign(localVarAxiosArgs.options, {url: basePath + localVarAxiosArgs.url})
                return axios.request(axiosRequestArgs);
            };
        },
        /**
         *
         * @summary Patches the user entity
         * @param {string} user_email
         * @param {UserPayload} user_payload
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        updateUser(user_email: string, user_payload: UserPayload, options?: any): (axios?: AxiosInstance, basePath?: string) => AxiosPromise<User> {
            const localVarAxiosArgs = UsersApiAxiosParamCreator(configuration).updateUser(user_email, user_payload, options);
            return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
                const axiosRequestArgs = Object.assign(localVarAxiosArgs.options, {url: basePath + localVarAxiosArgs.url})
                return axios.request(axiosRequestArgs);
            };
        },
        /**
         *
         * @summary Gets user entity by email
         * @param {string} user_email
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        userDetails(user_email: string, options?: any): (axios?: AxiosInstance, basePath?: string) => AxiosPromise<User> {
            const localVarAxiosArgs = UsersApiAxiosParamCreator(configuration).userDetails(user_email, options);
            return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
                const axiosRequestArgs = Object.assign(localVarAxiosArgs.options, {url: basePath + localVarAxiosArgs.url})
                return axios.request(axiosRequestArgs);
            };
        },
    }
};

/**
 * UsersApi - factory interface
 * @export
 */
export const UsersApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    return {
        /**
         *
         * @summary Returns a list of existing users
         * @param {number} [page]
         * @param {number} [page_size]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listUsers(page?: number, page_size?: number, options?: any) {
            return UsersApiFp(configuration).listUsers(page, page_size, options)(axios, basePath);
        },
        /**
         *
         * @summary Patches the user entity
         * @param {string} user_email
         * @param {UserPayload} user_payload
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        updateUser(user_email: string, user_payload: UserPayload, options?: any) {
            return UsersApiFp(configuration).updateUser(user_email, user_payload, options)(axios, basePath);
        },
        /**
         *
         * @summary Gets user entity by email
         * @param {string} user_email
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        userDetails(user_email: string, options?: any) {
            return UsersApiFp(configuration).userDetails(user_email, options)(axios, basePath);
        },
    };
};

/**
 * UsersApi - object-oriented interface
 * @export
 * @class UsersApi
 * @extends {BaseAPI}
 */
export class UsersApi extends BaseAPI {
    /**
     *
     * @summary Returns a list of existing users
     * @param {number} [page]
     * @param {number} [page_size]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    public listUsers(page?: number, page_size?: number, options?: any) {
        return UsersApiFp(this.configuration).listUsers(page, page_size, options)(this.axios, this.basePath);
    }

    /**
     *
     * @summary Patches the user entity
     * @param {string} user_email
     * @param {UserPayload} user_payload
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    public updateUser(user_email: string, user_payload: UserPayload, options?: any) {
        return UsersApiFp(this.configuration).updateUser(user_email, user_payload, options)(this.axios, this.basePath);
    }

    /**
     *
     * @summary Gets user entity by email
     * @param {string} user_email
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UsersApi
     */
    public userDetails(user_email: string, options?: any) {
        return UsersApiFp(this.configuration).userDetails(user_email, options)(this.axios, this.basePath);
    }

}
