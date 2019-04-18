
angular.module('onlineVeiculos', [])
.controller('OnlineVeiculosController', function($scope, $timeout, $http) {

  var eventoId = -1;
  var controller = this;

  controller.pessoasMesmoApartamento = [];
  controller.veiculosMesmoApartamento = [];
  controller.veiculo = {_id:'-1'}

  var refresh_data = function() {
    var data = {
      evento_veiculo_id: eventoId
    };
    $http.post('/online_veiculos/online_veiculo', JSON.stringify(data)).then(function (response) {
      evento_veiculo = response.data;
      if(evento_veiculo._id){
        eventoId = evento_veiculo._id;
        controller.veiculo = evento_veiculo.veiculo;
        controller.data_hora = evento_veiculo.data_hora;
        controller.panico = evento_veiculo.panico;
        controller.bateriaFraca = evento_veiculo.bateria_fraca;
        controller.veiculosMesmoApartamento = evento_veiculo.veiculos_associados;
        controller.pessoasMesmoApartamento = evento_veiculo.biometrias_associadas;
        $scope.playAudio = function() {
          var audio = new Audio('/sounds/Car_Horn_Honk_1-SoundBible.com-248048021.mp3');
          audio.play();
        };        
      }
    });
    
    $timeout(refresh_data, 1000);
  }

  $timeout(refresh_data, 1000);
});