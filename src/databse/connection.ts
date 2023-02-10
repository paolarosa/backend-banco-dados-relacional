import client from './config'

const startDatabase = async (): Promise<void> => {
    //faz a conexão com o banco de dados
    await client.connect();
    console.log("Database connected");
  };
  export default startDatabase