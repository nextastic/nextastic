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

it('should successfully make a PUT request', async () => {
  const data = { foo: 'bar' }
  const response = await http.put('https://api.example.com/data', data)

  expect(fetch).toHaveBeenCalledTimes(1)
  expect(fetch).toHaveBeenCalledWith('https://api.example.com/data', {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: expect.any(Headers),
  })

  expect(response).toEqual({ data: 'test data' })
})

it('should handle FormData in PUT requests', async () => {
  const formData = new FormData()
  formData.append('file', new Blob(['test']))

  await http.put('https://api.example.com/upload', formData)

  expect(fetch).toHaveBeenCalledWith('https://api.example.com/upload', {
    method: 'PUT',
    body: expect.any(FormData),
    headers: expect.any(Headers),
  })

  // Verify FormData content
  const sentFormData = (fetch as jest.Mock).mock.calls[0][1].body as FormData
  const sentFile = (await sentFormData.get('file')) as Blob
  const fileContent = await sentFile.text()

  expect(sentFormData instanceof FormData).toBe(true)
  expect(sentFile instanceof Blob).toBe(true)
  expect(fileContent).toBe('test')
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

  await expect(
    http.put('https://api.example.com/data', { foo: 'bar' }),
  ).rejects.toThrow('Unauthenticated')
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

  await expect(
    http.put('https://api.example.com/data', { foo: 'bar' }),
  ).rejects.toThrow('Bad Request')
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

  const response = await http.put('https://api.example.com/data', {
    foo: 'bar',
  })
  expect(response).toBe('plain text response')
})

it('should pass custom headers in the request', async () => {
  const data = { foo: 'bar' }
  await http.put('https://api.example.com/data', data, {
    headers: {
      'Custom-Header': 'test-value',
    },
  })

  expect(fetch).toHaveBeenCalledWith('https://api.example.com/data', {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: expect.any(Headers),
  })

  const headers = (fetch as jest.Mock).mock.calls[0][1].headers
  expect(headers.get('Custom-Header')).toBe('test-value')
  expect(headers.get('Accept')).toBe('application/json')
  expect(headers.get('Content-Type')).toBe('application/json')
})
