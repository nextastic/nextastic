import { http } from '../../src/client/http'

let actualFetch: typeof global.fetch

beforeEach(() => {
  actualFetch = global.fetch
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      clone: () => ({
        json: () => Promise.resolve({ data: 'test data' }),
      }),
    }),
  ) as jest.Mock
})

afterEach(() => {
  jest.restoreAllMocks()
  global.fetch = actualFetch
})

it('should successfully make a GET request', async () => {
  const response = await http.get('https://api.example.com/data')

  expect(fetch).toHaveBeenCalledTimes(1)
  expect(response).toEqual({ data: 'test data' })
})

it('should handle 401 unauthorized responses', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      status: 401,
      clone: () => ({
        json: () => Promise.resolve({ message: 'Unauthorized' }),
      }),
    }),
  ) as jest.Mock

  await expect(http.get('https://api.example.com/data')).rejects.toThrow(
    'Unauthenticated',
  )
})

it('should handle failed requests (status > 299)', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      status: 400,
      clone: () => ({
        json: () => Promise.resolve({ message: 'Bad Request' }),
      }),
    }),
  ) as jest.Mock

  await expect(http.get('https://api.example.com/data')).rejects.toThrow(
    'Bad Request',
  )
})

it('should handle invalid JSON responses', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      clone: () => ({
        json: () =>
          Promise.reject(new SyntaxError('Unexpected end of JSON input')),
        text: () => Promise.resolve('plain text response'),
      }),
    }),
  ) as jest.Mock

  const response = await http.get('https://api.example.com/data')
  expect(response).toBe('plain text response')
})

it('should pass custom headers in the request', async () => {
  await http.get('https://api.example.com/data', {
    headers: {
      'Custom-Header': 'test-value',
    },
  })

  expect(fetch).toHaveBeenCalledWith('https://api.example.com/data', {
    method: 'GET',
    headers: expect.any(Headers),
  })

  const headers = (fetch as jest.Mock).mock.calls[0][1].headers
  expect(headers.get('Custom-Header')).toBe('test-value')
  expect(headers.get('Accept')).toBe('application/json')
})
