import { omit, merge } from '../utils'

describe('utils', () => {
  it('omit object', () => {
    const obj = { name: 'geek', age: 18, sex: 'male' }
    const ret = omit(obj, ['name'])
    expect(ret).toEqual({
      age: 18,
      sex: 'male'
    })
  })

  it('merge obj arr to object', () => {
    const data = [{ age: 19 }, { job: 'engineer' }]
    const ret = merge(data)
    expect(ret).toEqual({ age: 19, job: 'engineer' })
  })
})
