import Adaptor from '../src';
import { expect } from 'chai';
import nock from 'nock';

const { execute, get, post, put, patch, del, alterState } = Adaptor;

function stdGet(state) {
  return execute(get('https://www.example.com/api/fake', {}))(state).then(
    nextState => {
      const { data, references } = nextState;
      expect(data).to.eql({ httpStatus: 'OK', message: 'the response' });
      expect(references).to.eql([{ triggering: 'event' }]);
    }
  );
}

function clientReq(method, state) {
  return execute(method('https://www.example.com/api/fake', {}))(state).then(
    nextState => {
      const { data, references } = nextState;
      expect(data).to.eql({ httpStatus: 'OK', message: 'the response' });
      expect(references).to.eql([{ a: 1 }]);
    }
  );
}

describe('The execute() function', () => {
  it('executes each operation in sequence', () => {
    let state = {};
    let operations = [
      state => {
        return { counter: 1 };
      },
      state => {
        return { counter: 2 };
      },
      state => {
        return { counter: 3 };
      },
    ];

    return execute(...operations)(state)
      .then(finalState => {
        expect(finalState).to.eql({ counter: 3 });
      });
  });

  it('assigns references, data to the initialState', done => {
    let state = {};

    let finalState = execute()(state);

    execute()(state)
      .then(finalState => {
        expect(finalState).to.eql({
          references: [],
          data: null,
        });
      })
      .then(done)
      .catch(done);
  });
});

const testServer = nock('https://www.example.com').persist();

describe('The get() function', () => {
  before(() => {
    testServer.get('/api/fake').reply(200, {
      httpStatus: 'OK',
      message: 'the response',
    });
  });

  after(() => {
    nock.cleanAll()
  });

  it('prepares nextState properly', () => {
    let state = {
      configuration: {
        username: 'hello',
        password: 'there',
        baseUrl: 'https://www.example.com',
      },
      data: {
        triggering: 'event',
      },
    };

    return execute(
      alterState(state => {
        state.counter = 1;
        return state;
      }),
      get('/api/fake', {}),
      alterState(state => {
        state.counter = 2;
        return state;
      })
    )(state).then(nextState => {
      const { data, references, counter } = nextState;
      expect(data).to.eql({ httpStatus: 'OK', message: 'the response' });
      expect(references).to.eql([{ triggering: 'event' }]);
      expect(counter).to.eql(2);
      console.log(nextState);
    });
  });

  it('works without a baseUrl', () => {
    let state = {
      configuration: {
        username: 'hello',
        password: 'there',
      },
      data: { triggering: 'event' },
    };
    return stdGet(state);
  });

  it('works with an empty set of credentials', () => {
    let state = {
      configuration: {},
      data: { triggering: 'event' },
    };
    return stdGet(state);
  });

  it('works with no credentials (null)', () => {
    let state = {
      configuration: null,
      data: {
        triggering: 'event',
      },
    };
    return stdGet(state);
  });
});

describe('The client', () => {
  before(() => {
    testServer.get('/api/fake').reply(200, {
      httpStatus: 'OK',
      message: 'the response',
    });

    testServer.post('/api/fake').reply(200, {
      httpStatus: 'OK',
      message: 'the response',
    });

    testServer.put('/api/fake').reply(200, {
      httpStatus: 'OK',
      message: 'the response',
    });

    testServer.patch('/api/fake').reply(200, {
      httpStatus: 'OK',
      message: 'the response',
    });

    testServer.delete('/api/fake').reply(200, {
      httpStatus: 'OK',
      message: 'the response',
    });
  });

  after(() => {
    nock.cleanAll();
  });
  const stdState = {
    configuration: null,
    data: { a: 1 },
  };

  it('works with GET', () => {
    let state = stdState;
    clientReq(get, state);
  });

  it('works with POST', () => {
    let state = stdState;
    clientReq(post, state);
  });

  it('works with PATCH', () => {
    let state = stdState;
    clientReq(patch, state);
  });

  it('works with POST', () => {
    let state = stdState;
    clientReq(put, state);
  });

  it('works with POST', () => {
    let state = stdState;
    clientReq(del, state);
  });
});

describe('get', () => {
  before(() => {
    testServer.get('/api/fake').reply(200, function (url, body) {
      return [url, this.req.headers];
    });
  });

  after(() => {
    nock.cleanAll()
  });

  it('accepts headers', async () => {
    const state = {
      configuration: {
        username: 'hello',
        password: 'there',
      },
      data: { triggering: 'event' },
    };

    const finalState = await execute(
      get('https://www.example.com/api/fake', {
        headers: { 'x-openfn': 'testing' },
      })
    )(state);

    expect(finalState.data).to.eql([
      '/api/fake',
      {
        authorization: 'Basic aGVsbG86dGhlcmU=',
        host: 'www.example.com',
        'x-openfn': 'testing',
      },
    ]);
    expect(finalState.references).to.eql([{ triggering: 'event' }]);
  });

  it('accepts authentication for http basic auth', async () => {
    const state = {
      configuration: {
        username: 'hello',
        password: 'there',
      },
      data: { triggering: 'event' },
    };

    const finalState = await execute(
      get('https://www.example.com/api/fake')
    )(state);

    expect(finalState.data).to.eql([
      '/api/fake',
      {
        authorization: 'Basic aGVsbG86dGhlcmU=',
        host: 'www.example.com',
      },
    ]);
  });

  it('can enable gzip', async () => {
    const state = {
      configuration: {},
      data: { },
    };

    const finalState = await execute(
      get('https://www.example.com/api/fake', {gzip: true})
    )(state);

    expect(finalState.data).to.eql([
      '/api/fake',
      {
        "accept-encoding": "gzip, deflate",
        host: 'www.example.com',
      },
    ]);
  });

  it('allows query strings to be set');
  // get('https://www.example.com/api/fake', {query: { id: 1}})

  it('can follow redirects');
  // get('https://www.example.com/api/fake', {followAllRedirects: true})
  // Reply with 302, 302 then 200

  it('can keep and reuse cookies');
  // get('https://www.example.com/api/fake', {keepCookie: true})
  // reply with cookies and check state.data.__cookie

  it('accepts callbacks and calls them with nextState');
  // get('https://www.example.com/api/fake', {}, function (state) => {})

  it('returns a promise that contains nextState');
  // get('https://www.example.com/api/fake', {}).then((state) => {})
});

describe('post', () => {
  it('can set JSON on the request body');
  // post `json` or `body`
  it('can set FormData on the request body');
  // post `formData' or `body`

  // Whats the convention here?
});
