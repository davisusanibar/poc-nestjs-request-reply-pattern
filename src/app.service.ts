import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client, ClientKafka, Transport } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AppService implements OnModuleInit {
  @Client({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['broker:9092'],
      },
      consumer: {
        groupId: 'consumer-group-flow-01',
      },
    },
  })
  private client: ClientKafka;

  onModuleInit() {
    this.client.subscribeToResponseOf('topicopedidos');
    return this.client.connect();
  }

  getHello(): string {
    return 'Hi T0paya!';
  }

  async sendMessageToKafka(data: any) {
    // enviamos el mensaje por protocolo kafka hacia el topico con el nombre que deseemos
    const response$ = this.client.send('topicopedidos', data);
    // aca esperamos la respuesta del TOPICO DE RESPUESTA que esta asociado a la SOLICITUD ESPECIFICA DEL CLIENTE
    // depende que termine: @MessagePattern('topicopedidos')
    return await lastValueFrom(response$);
    // response$: Es un observable que emite valores que se reciben en el topico de respuesta .reply generado
    // lastValueFrom: esta esperando una respuesta del topico de respuesta que se genera automaticamente cuando enviamos un mensaje al topico de pedidos: topicopedidos
  }
}
