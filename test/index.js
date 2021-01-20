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

    return execute(...operations)(state).then(finalState => {
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
    nock.cleanAll();
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

    testServer.get('/api/fake?id=1').reply(200, function (url, body) {
      return [url, this.req.headers];
    });

    testServer
      .get('/api/fake-endpoint')
      .matchHeader('followAllRedirects', true)
      .reply(301, undefined, {
        Location: 'https://www.example.com/api/fake-endpoint-2',
      })
      .get('/api/fake-endpoint-2')
      .reply(302, undefined, {
        Location: 'https://www.example.com/api/fake-endpoint-3',
      })
      .get('/api/fake-endpoint-3')
      .reply(200, function (url, body) {
        return url;
      });

    testServer.get('/api/fake-cookies').reply(
      200,
      function (url, body) {
        return url;
      },
      { 'Set-Cookie': 'tasty_cookie=choco' }
    );

    testServer.get('/api/fake-callback').reply(200, function (url, body) {
      return { url, id: 3 };
    });

    testServer.get('/api/fake-promise').reply(200, function (url, body) {
      return new Promise((resolve, reject) => {
        resolve({ url, id: 3 });
      });
    });
  });

  after(() => {
    nock.cleanAll();
  });

  it.only('accepts headers', async () => {
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

    expect(finalState.data[0]).to.eql('/api/fake');

    expect(finalState.data[1]).to.haveOwnProperty('x-openfn', 'testing');

    expect(finalState.data[1]).to.haveOwnProperty(
      'authorization',
      'Basic aGVsbG86dGhlcmU='
    );

    expect(finalState.data[1]).to.haveOwnProperty('host', 'www.example.com');

    expect(finalState.references).to.eql([{ triggering: 'event' }]);
  });

  it.only('accepts authentication for http basic auth', async () => {
    const state = {
      configuration: {
        username: 'hello',
        password: 'there',
      },
      data: { triggering: 'event' },
    };

    const finalState = await execute(get('https://www.example.com/api/fake'))(
      state
    );

    expect(finalState.data[0]).to.eql('/api/fake');

    expect(finalState.data[1]).to.haveOwnProperty(
      'authorization',
      'Basic aGVsbG86dGhlcmU='
    );

    expect(finalState.data[1]).to.haveOwnProperty('host', 'www.example.com');
  });

  it.only('can enable gzip', async () => {
    const state = {
      configuration: {},
      data: {},
    };

    const finalState = await execute(
      get('https://www.example.com/api/fake', { gzip: true })
    )(state);

    expect(finalState.data[0]).to.eql('/api/fake');

    expect(finalState.data[1]).to.haveOwnProperty(
      'accept-encoding',
      'gzip, deflate'
    );

    expect(finalState.data[1]).to.haveOwnProperty('host', 'www.example.com');
  });

  it('allows query strings to be set', async () => {
    const state = {
      configuration: {},
      data: {},
    };

    const finalState = await execute(
      get('https://www.example.com/api/fake', { query: { id: 1 } })
    )(state);
    expect(finalState.data).to.eql([
      '/api/fake?id=1',
      {
        host: 'www.example.com',
      },
    ]);
  });

  it('can follow redirects', async () => {
    const state = {
      configuration: {},
      data: {},
    };

    const finalState = await execute(
      get('https://www.example.com/api/fake-endpoint', {
        headers: { followAllRedirects: true },
      })
    )(state);
    expect(finalState.data.body).to.eql('/api/fake-endpoint-3');
  });

  it('can keep and reuse cookies', async () => {
    const state = {
      configuration: {},
      data: {},
    };

    const finalState = await execute(
      get('https://www.example.com/api/fake-cookies', {
        keepCookie: true,
      })
    )(state);
    expect(finalState.data.__cookie).to.eql('tasty_cookie=choco');
  });

  it('accepts callbacks and calls them with nextState', async () => {
    const state = {
      configuration: {},
      data: {},
    };

    const finalState = await execute(
      get('https://www.example.com/api/fake-callback', {}, state => {
        return state;
      })
    )(state);
    expect(finalState.data.id).to.eql(3);
  });

  it('returns a promise that contains nextState', async () => {
    const state = {
      configuration: {},
      data: {},
    };

    const finalState = await execute(
      get('https://www.example.com/api/fake-promise', {})
    )(state).then(state => state);
    expect(finalState.data.id).to.eql(3);
  });
});

describe('post', () => {
  before(() => {
    testServer.post('/api/fake-json').reply(200, function (url, body) {
      return body;
    });

    testServer.post('/api/fake-form').reply(200, function (url, body) {
      return body;
    });

    testServer.post('/api/fake-formData').reply(200, function (url, body) {
      return body;
    });

    testServer
      .post('/api/fake-custom-success-codes')
      .reply(302, function (url, body) {
        return { body, statusCode: 302 };
      });
  });

  it('can set JSON on the request body', async () => {
    const state = {
      configuration: {},
      data: { name: 'test', age: 24 },
    };

    const finalState = await execute(
      post('https://www.example.com/api/fake-json', { body: state.data })
    )(state);
    expect(finalState.data.body).to.eql({ name: 'test', age: 24 });
  });

  it('can set data via Form param on the request body', async () => {
    let form = {
      username: 'fake',
      password: 'fake_pass',
    };
    const state = {
      configuration: {},
      data: form,
    };

    const finalState = await execute(
      post('https://www.example.com/api/fake-form', {
        form: state.data,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
    )(state);
    expect(finalState.data.body).to.eql('username=fake&password=fake_pass');
  });

  it('can set FormData on the request body', async () => {
    let formData = {
      id: 'fake_id',
      parent: 'fake_parent',
      mobile_phone: 'fake_phone',
    };
    const state = {
      configuration: {},
      data: formData,
    };

    const finalState = await execute(
      post('https://www.example.com/api/fake-formData', {
        formData: state => {
          return state.data;
        },
      })
    )(state);
    expect(finalState.data.body).to.contain('Content-Disposition: form-data');
  });

  it('can set successCodes on the request', async () => {
    let formData = {
      id: 'fake_id',
      parent: 'fake_parent',
      mobile_phone: 'fake_phone',
    };
    const state = {
      configuration: {},
      data: formData,
    };

    const finalState = await execute(
      post('https://www.example.com/api/fake-custom-success-codes', {
        formData: state => {
          return state.data;
        },
        options: { successCodes: [302] },
      })
    )(state);
    expect(finalState.data.statusCode).to.eq(302);
  });
});

describe('put', () => {
  before(() => {
    testServer.put('/api/fake-items/6').reply(200, function (url, body) {
      return { body, statusCode: 200 };
    });
  });

  it('sends a put request', async () => {
    const state = {
      configuration: {},
      data: { name: 'New name' },
    };
    const finalState = await execute(
      put('https://www.example.com/api/fake-items/6', {
        body: state.data,
      })
    )(state);

    expect(finalState.data.body.statusCode).to.eql(200);
    expect(finalState.data.body.body).to.eql({ name: 'New name' });
  });
});

describe('patch', () => {
  before(() => {
    testServer.patch('/api/fake-items/6').reply(200, function (url, body) {
      return { body, statusCode: 200 };
    });
  });

  it('sends a patch request', async () => {
    const state = {
      configuration: {},
      data: { name: 'New name', id: 6 },
    };
    const finalState = await execute(
      patch('https://www.example.com/api/fake-items/6', {
        body: state.data,
      })
    )(state);

    expect(finalState.data.body.statusCode).to.eql(200);
    expect(finalState.data.body.body).to.eql({ id: 6, name: 'New name' });
  });
});

describe('delete', () => {
  before(() => {
    testServer.delete('/api/fake-del-items/6').reply(204, function (url, body) {
      return JSON.stringify({});
    });
  });

  it('sends a delete request', async () => {
    const state = {
      configuration: {},
      data: {},
    };
    const finalState = await execute(
      del('https://www.example.com/api/fake-del-items/6', {
        options: {
          successCodes: [204],
        },
      })
    )(state);

    // TODO: fix this interface, if `Utils.tryJson` cleanly converts the
    // response body, it won't be under the `body` key. See `put()` example
    // above where we have to look inside `data.body.body`.
    expect(finalState.data).to.eql({});
  });
});
