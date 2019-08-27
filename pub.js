var express = require('express')
var bodyParser = require('body-parser')
var app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.listen(3000,function(){console.log('publiser running on 3000')})

app.post('/pub',function(req,res){
    var amqp = require('amqplib/callback_api');
    const connURL = 'amqp://lrqntwsx:HXxAgN1oeUv44i-1NZRvEiGohsNYbqVz@wombat.rmq.cloudamqp.com/lrqntwsx';

    amqp.connect(connURL, function(error0, connection) {
        if(error0){
            throw error0
        }else{
            connection.createChannel(function(error,channel){
                if(error){
                    throw error
                }else{
                    let exchange = 'requester'
                    let correlationId = req.body.taskID
                    channel.assertExchange(exchange,'direct',{durable:true})
                    channel.assertQueue('request',{persistent:true})
                    channel.publish(exchange,'request',Buffer.from(JSON.stringify({url:req.body.url})),{correlationId})
                    console.log('message sent !')
                    res.send('message sent !')
                }
            })
        }
    });

})
