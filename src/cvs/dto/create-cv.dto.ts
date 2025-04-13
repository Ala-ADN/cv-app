export class CreateCvDto {
  name: string;
  firstname: string;
  age: number;
  cin: string;
  job: string;
  path: string;
  skills?: number[];
  userId?: number;
}
