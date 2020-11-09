import { expect, assert } from 'chai'

import { HTTPRepository } from '../../lib/repositories/http_repository'
import { HTTPClient, HTTPRequest, HTTPResponse } from '../../lib/http_clients/http_interface'

class GoodClient implements HTTPClient {
  mockResponse: object
  passes: number
  constructor(mockResponse?: object) {
    this.mockResponse = mockResponse
    this.passes = 0
  }

  Do = async (request: HTTPRequest): Promise<HTTPResponse> => {
    let response = {
      data: this.mockResponse || (this.passes < 1 ? {name: "stuff", id: 123} : [{name: "other_stuff", id: 345}]),
      status: 200,
      statusText: "ok",
      headers: this.passes < 1 ? {"After-Cursor": "asdf"} : {}
    }
    this.passes++
    return response
  }
}

class BadClient implements HTTPClient {
  Do = async (request: HTTPRequest): Promise<HTTPResponse> => {
    return {  data: {message: "uh oh!"}, status: 500, statusText: "is down", headers: {} }
  }
}

describe('With a Good Client', () => {
  it('Retrieves the index when API returns one result', async () => {
    let httpClient = new GoodClient()
    let repo = new HTTPRepository(httpClient)
    let result = await repo.Query({url: "/good_stuff", cursor: "After-Cursor"})
    expect(result.data).to.have.deep.members([ { name: 'stuff', id: 123 }, { name: 'other_stuff', id: 345 } ])
  })
  it('Retrieves an item', async () => {
    let httpClient = new GoodClient()
    let repo = new HTTPRepository(httpClient)
    let result = await repo.ReadResource({url: "/good_stuff", id: 123})
    expect(result.data).to.eql({name: "stuff", id: 123})
  })
  it('Retrieves an with ID on URL', async () => {
    let httpClient = new GoodClient()
    let repo = new HTTPRepository(httpClient)
    let result = await repo.ReadResource({url: "/good_stuff/123"})
    expect(result.data).to.eql({name: "stuff", id: 123})
  })
  it('Writes an item', async () => {
    let httpClient = new GoodClient({id: 123})
    let repo = new HTTPRepository(httpClient)
    let result = await repo.WriteResource({url: "/good_stuff", data: {name: "stuff"}})
    expect(result.data).to.eql({id: 123})
  })
  it('Updates an item', async () => {
    let httpClient = new GoodClient({id: 123, name: "updated_stuff"})
    let repo = new HTTPRepository(httpClient)
    let result = await repo.WriteResource({url: "/good_stuff", data: {id: 123, name: "updated_stuff"}})
    expect(result.data).to.eql({name: "updated_stuff", id: 123})
  })
  it('Destroys an item', async () => {
    let httpClient = new GoodClient(null)
    let repo = new HTTPRepository(httpClient)
    let result = await repo.DestroyResource({url: "/good_stuff", data: {id: 123}})
    expect(result.data).to.eql({})
  })
})

describe('When the API Client is broken', () => {
  it('Retrieves the index', async () => {
    let httpClient = new BadClient()
    let repo = new HTTPRepository(httpClient)
    let result = await repo.Query({url: "/good_stuff"})
    expect(result).to.equal(undefined)
  })
  it('Retrieves an item', async () => {
    let httpClient = new BadClient()
    let repo = new HTTPRepository(httpClient)
    let result = await repo.ReadResource({url: "/good_stuff", id: 123})
    expect(result).to.equal(undefined)
  })
  it('Writes an item', async () => {
    let httpClient = new BadClient()
    let repo = new HTTPRepository(httpClient)
    let result = await repo.WriteResource({url: "/good_stuff", data: {name: "stuff"}})
    expect(result).to.equal(undefined)
  })
  it('Updates an item', async () => {
    let httpClient = new BadClient()
    let repo = new HTTPRepository(httpClient)
    let result = await repo.WriteResource({url: "/good_stuff", data: {id: 123, name: "updated_stuff"}})
    expect(result).to.equal(undefined)
  })
  it('Destroys an item', async () => {
    let httpClient = new BadClient()
    let repo = new HTTPRepository(httpClient)
    let result = await repo.DestroyResource({url: "/good_stuff", data: {id: 123}})
    expect(result).to.equal(undefined)
  })
})