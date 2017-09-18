import { expect } from 'chai';

import nock from 'nock';
import ClientFixtures, { fixtures } from './ClientFixtures'

import Adaptor from '../src';
const { execute, event, dataElement, get } = Adaptor;


describe("execute", () => {

  it("executes each operation in sequence", (done) => {
    let state = {}
    let operations = [
      (state) => { return {counter: 1} },
      (state) => { return {counter: 2} },
      (state) => { return {counter: 3} }
    ]

    execute(...operations)(state)
    .then((finalState) => {
      expect(finalState).to.eql({ counter: 3 })
    })
    .then(done).catch(done)


  })

  it("assigns references, data to the initialState", () => {
    let state = {}

    let finalState = execute()(state)

    execute()(state)
    .then((finalState) => {
      expect(finalState).to.eql({
        references: [],
        data: []
      })
    })

  })
})

describe("get", () => {

  before(() => {
     nock('https://www.example.com')
     .get('/api/fake')
     .reply(200, {
       httpStatus:'OK',
       message: 'the response'
     });
  })

  it("get adds response to state.data", () => {
    let state = {
      configuration: {
        username: "hello",
        password: "there",
        baseUrl: 'https://www.example.com'
      },
      data: [
        {"triggering": "event"}
      ]
    };

    return execute(
      get("/api/fake")
    )(state)
    .then((state) => {
      console.log(state);
      let responseBody = state.data
      expect(responseBody).to.eql([
        {triggering: 'event'},
        'the response'
      ])
    })

  })

})
