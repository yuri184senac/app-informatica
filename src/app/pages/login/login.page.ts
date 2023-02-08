import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Usuario } from 'src/app/Core/models/vitima/login.interface';
import { UtilidadesService } from 'src/app/Core/services/utilidades.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  isTextFieldType: boolean | undefined;
  botaoCL: boolean = true;
  botaoCLmsg: string = 'Cadastra-se';
  titulo: string = 'Login';
  //Tenho que ver onde vou por esse httpOptions
  httpOptions = {
    headers: new HttpHeaders({'Content-Type' : 'application/json'})
  } 
  //---------------------------------
  cadastroForm! : FormGroup
  error_messages = {
    'cpf': [
      { type: 'required',  message: '*'},
      { type: 'minlength', message: '* o cpf deve ter 11 algarismos'},
      { type: 'maxlenght', message: '* o cpf deve ter 11 algarismos'},
      { type: 'pattern',   message: '* somente números são permitidos'}
    ],

    'email': [
      { type: 'required',  message: '*'},
      { type: 'minlength', message: '* número de caracteres insuficiente'},
      { type: 'maxlenght', message: '* você excedeu o número de caracteres'},
      { type: 'email',     message: '* por favor, digite um email válido'}
    ],
    
    'password': [
      { type: 'required',  message: '*'},
      { type: 'minlength', message: 'Sua senha tem menos de 4 caracteres'},
      { type: 'maxlenght', message: 'Sua senha passou do tamanho permetido'},

    ],

    'confirmPassword': [
      { type: 'required',  message: 'Campo obrigatório'},
      { type: 'Mustmatch', message: 'errado'}
    ]
  }

  constructor(
    private readonly httpClient: HttpClient, 
    private util:UtilidadesService, 
    private formBuilder: FormBuilder
  ) { 
   
  }

  ngOnInit() {
    this.cadastroForm = this.formBuilder.group({
      cpf: ['', 
        Validators.compose([
        Validators.required,
        Validators.minLength(11),
        Validators.maxLength(11),
        Validators.pattern('^[0-9]+$')
      ])],
      email: new FormControl('', Validators.compose([
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(30),
        Validators.email
      ])),
      password: new FormControl('', Validators.compose([
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(30)
      ])),
      confirmPassword: new FormControl('', Validators.compose([
        Validators.required
      ]))
    }, 
    {
      validators: this.mustMatch('password','confirmPassword')
    }
    );
  }
  
  get cadastroFormControl() {
    return this.cadastroForm.controls;
  }

  togglePasswordFieldType() {
    this.isTextFieldType = !this.isTextFieldType;
  }
  
  //Metodo de comparar senhas
  mustMatch(password: string, confirmPassword: string) {
    return (fg: FormGroup) => {
      const passwordControl = fg.controls[password];
      const confirmPasswordControl = fg.controls[confirmPassword];

      if(confirmPasswordControl.errors && !confirmPasswordControl.errors['Mustmatch']) {
        return;
      }

      if(passwordControl.value !== confirmPasswordControl.value) {
        confirmPasswordControl.setErrors({Mustmatch: true});
      } else {
        confirmPasswordControl.setErrors(null);
      }
    }
  }
  
  public mudarCadastroLogin() {
    this.botaoCL = !this.botaoCL;
    if (this.botaoCL) {
      this.botaoCLmsg ='Cadastra-se'
      this.titulo = "Login";
    } else {
      this.botaoCLmsg ='Login';
      this.titulo = 'Cadastro';
    }
  }

  public cadastrar() {
    //Pega os valores do formulario
     let objCadastro: Usuario = {
       cpf: this.cadastroForm.value['cpf'],
       senha: this.cadastroForm.value['confirmPassword'],
       email: this.cadastroForm.value['email']
     }
    console.log("form",this.cadastroForm.value['cpf']);
    console.log(objCadastro)

    //Faz a chamada do endpoint de cadastro
    this.httpClient.post<Usuario|string>('http://127.0.0.1:4000/vitima/criar-login',objCadastro,this.httpOptions).subscribe((result) => {
      if(result == "200") {
        this.util.informando('Cadastro realizado com sucesso!', 'success', 'top', 5000);
      } else {
        this.util.informando('CPF já cadastrado!', 'danger', 'top', 5000);
      }
    });
  }

}
