exports.fetchAccounts = (req,res) => {
    const accounts = [
        {
            username:'bacoor',
            password:'Sunny'
        }
    ]

    res.send({
        message:"Account Controller!",
        response: accounts
    })
}