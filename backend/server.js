import app from"./app.js"
import connectDB from "./Src/DB/dataBase.js"

const PORT = process.env.PORT || 4444

connectDB()
try {
    app.listen(PORT, () => {
        console.log(`\nServer is running at: http://localhost:${PORT}`)
    })
} catch (error) {
   console.log("\nError during Connetiomn of server", error)    
}