export interface WriteHandler {
  write(message: string): Promise<number>;
}
export interface ReadHandler {
  read(): Promise<string | null>;
}

export default class Dim {
  writeHanldler: WriteHandler;
  readHanldler: ReadHandler;

  constructor(writeHanldler: WriteHandler, readHanldler: ReadHandler) {
    this.writeHanldler = writeHanldler;
    this.readHanldler = readHanldler;
  }

  private write = async (message: string): Promise<number> => {
    console.log(message);
    const resuslt = await this.writeHanldler.write(message);
    return resuslt;
  };

  private read = async (): Promise<string | null> => {
    const resuslt = await this.readHanldler.read();
    return resuslt;
  };

  private transceive = async (): Promise<number> => {
    return 1;
  };

  tlsHandshake = async (): Promise<number> => {
    const rv = await this.transceive();
    if (rv !== 1) {
      return 0;
    }

    let i = 0;
    for (i = 0; i < 10; i++) {
      await this.write(`Client message(${i}-1)`);
      await this.write(`Client message(${i}-2)`);
      await this.write(`Client message(${i}-3)`);
      await this.write(`Client message(${i}-4)`);
      await this.write(`Client message(${i}-5)`);
      const result = await this.read();
      console.log(`Read message: ${result}`);
      console.log(`Read message: ${result}`);
      console.log(`Read message: ${result}`);
      console.log(`Read message: ${result}`);
      console.log(`Read message: ${result}`);
    }
    return 1;
  };
}
