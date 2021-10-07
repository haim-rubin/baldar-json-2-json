
const express = require('express')
const sql = require('mssql')
const path = require('path')
const config = require('./config.json')
const app = express()

const runner = () => {
    const runSqlStoredProcedure = async ({ barcode, actLocation, invokeId }) => {
        try {            
          const pool = await sql.connect(config.connectionString) 
        
          // Stored procedure
          const results = 
            await pool.request()
              .input('barcode', sql.VarChar, barcode)
              .input('actLocation', sql.VarChar, actLocation)
              .input('invokeId', sql.Int, invokeId)
              .execute(config.storedProcedure)
          
          return results
        } catch (err) {
          console.error(err)
          throw error
        }
    }

    app.use(express.urlencoded({extended: true}));
    app.use(express.json())
    
    app.get('/', async(req, res) => {
      res.sendFile(path.join(__dirname, '../html/index.html'))
    })
    
    app.post('/', async (req, res) => {
      try {
        const { barcode, actLocation, invokeId } = req.body
        const results = await runSqlStoredProcedure({ barcode, actLocation, invokeId })
        const { recordset } = results
        const [firstRow] = recordset
        res.json(firstRow)
      } catch(error) {
        res.json({ error })
      }
    })
   
    app.listen(config.port, () => {
      console.log(`Example app listening at http://localhost:${config.port}`)
    })
}

module.exports = runner
