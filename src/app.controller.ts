import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('test/sync')
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test/synckafka')
  async getHelloSyncKafka(): Promise<any> {
    // creamos simulamos una data que deberia venir desde el cliente
    const data = {
      message: 'payload demo del cliente enviado por HTTP request',
    };
    const response = await this.appService.sendMessageToKafka(data);
    // NestJS hace todo su trabajo detras de escena y lo que pasa es lo siguiente:
    // (1) DETECTA que se ha escrito un mensaje a un topico de kafka: topicopedidos
    // (2) Delega la responsabilidad a nosotros para hacer lo que DESEEMOS en: @MessagePattern('topicopedidos')
    // (3) ESCRIBE LA RESPUESTA EN UN TOPICO .REPLY con un payload que nosotros le definamos
    // (4) Creamos un OBSERVABLE que espera a que haya llegado un payload al topico .reply creado
    // (5) Y finalmente RESPONDEMOS al cliente por HTTP
    return response;
  }


  /*
  LAS LINEAS SIGUIENTE SIMULAN A LO QUE HARIA UN ORQUESTADOR PARA HACER SUSCRIBE AL TOPICO DE PEDIDOS QUE DEJARIA EL JOURNEY
   */

  // Esta funcion debe procesar los mensajes que llegan al topico que se defina,
  // luego debe retornar una respuesta que tomada por el engine NestJS y enviara esta respuesta
  // a traves del topico de repuesta generado automaticamente
  @MessagePattern('topicopedidos')
  async handleRequest(data: any) {
    // Aca se procesa el request del cliente
    // El nombre del topico de respuesta que se genera ES .REPLY
    // Estos topicos deberian ser efimeros: se deben de borar poco despues que se reciba la respuesta (FIXME! Revisar documentacion)
    // Para que funciones este patron de SOLICITUD-RESPUESTA cpn Kafka este patron necesita un Topico?Cana unico
    // Definimos el mensaje que enviaremos al topico de respuesta con el sigueinte payload
    return { response: 'Respuesta que enviaremos al topico', data }; //TOPICO .REPLY CREADO
  }
}
