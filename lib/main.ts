import OneLoginAppsRepository  from './onelogin/apps/apps'
import OneLoginUsersRepository  from './onelogin/users/users'
import OneLoginSmartMFA  from './onelogin/smart_mfa/smart_mfa'
import PKCE  from './onelogin/pkce/pkce'


import AxiosClientAdapter from './http_clients/client_adapters/axios_client_adapter'
import { OneLoginHTTPClient, OneLoginClientConfig } from './http_clients/onelogin_http_client'
import { BlankHTTPClient } from './http_clients/blank_http_client'
import { HTTPRepository } from './repositories/http_repository'
import { HTTPClient } from './http_clients/interface'

export class Client {
  client: HTTPClient
  resourceRepository: HTTPRepository
  appsRepository: OneLoginAppsRepository
  usersRepository: OneLoginUsersRepository
  smartMFA: OneLoginSmartMFA

  constructor(config: OneLoginClientConfig){
    this.client = new OneLoginHTTPClient(config, new AxiosClientAdapter())
    this.resourceRepository = new HTTPRepository(this.client)
    this.appsRepository = new OneLoginAppsRepository(this.resourceRepository)
    this.usersRepository = new OneLoginUsersRepository(this.resourceRepository)
    this.smartMFA = new OneLoginSmartMFA(this.client)
  }
}

let httpClient = new BlankHTTPClient({ timeout: 3000 }, new AxiosClientAdapter())
let PKCEClient = new PKCE(httpClient)

module.exports = { Client, PKCEClient }
