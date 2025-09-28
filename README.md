### Read Me
## Setup

1. Clone the repo (or download it), then open a terminal in the root folder
```bash
git clone "https://github.com/eliasubz/Authentification-and-Veo3-API-calls-in-proxy-server.git"
cd ".\Authentification-and-Veo3-API-calls-in-proxy-server\"
```

2. Install Dependencies:
```bash
npm install
```

3. Add a `.env` file and add your own variables to connecting to your mongoDB and RedisDB:

```bash
mongo_uri=""mongodb+srv://user:yourApiKey@cluster.net/?retryWrites=true&w=majority&appName=Cluster0"
REDIS_URL=""
```
4. Open two terminals (you can split them in vscode) and run the following commands in:

```bash
# In the first terminal
node src/app.js
# In the first terminal
node src/workers/veo3Worker.js
```

## Purpose
In this project I want to implement a server that can store Users in a MongoDB and uses a BullQM queue to perform Jobs. The current Job is an automatically generated image using a stable-diffusion. This task would be performed inside of a google colab and can be done by running a gradio rest-api inside. These stable-diffusion scripts will be published soon.

The user can be authenticated stores users/logins and the amount of credits each user has. 

## Tech Stack

- Backend: Node.js, Express.js
- Database: MongoDB (Atlas or local)
- Queue: Redis + BullMQ
- Auth: JWT with role-based access control
- Worker: Node.js worker process (veo3Worker.js) for long-running jobs

## Endpoint Summary
You can query http://localhost:5000 in Postman/Requestly and append the different routes that are specified. Ensure to create a user first and put the web-token that is returned over the http://localhost:5000/api/login route in the header to access the full range of features. 
### Auth

- POST /api/register → Register new user

- POST /api/login → Login user and return JWT

### User

- GET /api/user → Access user dashboard (requires valid token)

- GET /api/admin → Access admin dashboard (requires admin role)

### Image or Video Generation (needs seperate server)

- POST /api/veo3/generate → Enqueue a new generation job (credits required)

- GET /api/veo3/credits → Get user credit balance

- GET /api/veo3/buy_credit → Buy additional credits