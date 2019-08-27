var express = require('express')
var bodyParser = require('body-parser')
var rp = require('request-promise');
var app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.listen(3001,function(){console.log('subscriber running on 3001')})

var amqp = require('amqplib/callback_api');
const connURL = 'amqp://lrqntwsx:HXxAgN1oeUv44i-1NZRvEiGohsNYbqVz@wombat.rmq.cloudamqp.com/lrqntwsx';

amqp.connect(connURL,function(error,connection){
    if(error){
        throw error;
    }else{
        connection.createChannel(function(error,channel){
            if(error){
                throw error
            }else{
                let exchange = 'requester'
                channel.assertExchange(exchange,'direct',{
                    durable:true
                })
                channel.assertQueue('',{},function(error,q){
                    if(error){
                        throw error
                    }else{
                        channel.bindQueue(q.queue,exchange,'request')

                        channel.consume(q.queue,function(msg){
                            var data = JSON.parse(msg.content.toString())
                            console.log(data)
                            rp(data.url)
                                .then(response=>{
                                    data.response = JSON.parse(response);
                                    channel.assertQueue('response',{persistent:true})
                                    channel.publish(exchange,'response',Buffer.from(JSON.stringify(data)),{correlationId:msg.properties.correlationId})
                                })
                                .catch(error=>{
                                    data.error = error;
                                })
                        },{
                            noAck: false
                        })
                    }
                })
            }
        })
    }
})

app.get('/messages/:taskID',function(req,res){
    console.log('message api hit')
    amqp.connect(connURL,function(error,connection){
        if(error){
            throw error;
        }else{
          var timeout_error = setTimeout(() => {
            console.log("Inside timeout");
            res.status(500).send("Record doesn't exist for task id: " + req.params.taskID);
            connection.close()
          }, 90001);

            console.log('connection created !')
            connection.createChannel(function(error,channel){
                if(error){
                    throw error
                }else{
                    console.log('channel created !')
                    let exchange = 'requester';
                    channel.assertExchange(exchange,'direct',{
                        durable:true
                    })
                    console.log('assert exchange')
                    channel.assertQueue('response',{persistent:true},function(error,q){
                        if(error){
                            throw error
                        }else{

                            channel.bindQueue(q.queue,exchange,'response')
                            channel.consume(q.queue,function(msg){
                                if (msg.properties.correlationId === req.params.taskID) {
                                    var data = JSON.parse(msg.content.toString())
                                    res.json(data)
                                    clearTimeout(timeout_error);
                                    connection.close()
                                }
                            },{
                                noAck: true
                            })
                        }
                    })
                }
            })
        }
    })
})

process.on('unhandledRejection', (err) => {
  console.log(err);
})
