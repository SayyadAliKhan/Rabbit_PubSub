# Rabbit_PubSub
Publisher Subscriber model using RabbitMQ

1. npm install to download required modules
2. node sub.js --> to start subscriber server which will run on 3001
3. node pub.js --> to start publisher server which will run on 3000
4. use postman or any other tool to make a service call
5. make a post method call http://localhost:3000/pub with body(application/json)
{
	"url" : "https://baconipsum.com/api/?type=meat-and-filler",
	"taskID" : "task1"
}
6. Once you get the response "message sent", make another rest call, this time a get method http://localhost:3001/messages/task1
7. If the taskid exist, we will get the response and if it doesn't exist after 90 sec a custom message will be sent.

