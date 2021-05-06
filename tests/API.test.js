const {app} = require('../app')

const supertest = require('supertest')
const request = supertest(app)

describe('Basic Test',function(){

   it('GET: /', async done=>{
            const res = await request.get('/')
            expect(res.status).toBe(200)
            expect(res.body).toBeTruthy()
            
            done()
       });
})