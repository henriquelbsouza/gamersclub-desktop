const GC_URL = window.location.hostname;

const isFirefox = typeof InstallTrigger !== 'undefined';
let intervalCriarLobby = null;

function adicionarBotaoForcarCriarLobby() {
  if ( !$( '#criarLobbyBtn' ).length ) {
    $( '#gcbooster_botoes' ).append(
      $( '<button/>', {
        'id': 'criarLobbyBtn',
        'class': 'WasdButton',
        'css': { 'background-color': 'orange', 'border-radius': '4px' },
        'type': 'button',
        'text': 'Criar Lobby Rápida'
      } )
    );
    addListenersCriarLobby();
  } else {
    $( '#criarLobbyBtn' )
      .css( { 'background-color': 'orange', 'border-radius': '4px' } )
      .text( 'Criar Lobby Rápida' )
      .removeClass( 'Cancelar' );
  }
}

function adicionarBotaoCancelarCriarLobby() {
  $( '#criarLobbyBtn' )
    .css( { 'background-color': 'red', 'border-radius': '4px' } )
    .text( 'Cancelar Criação...' )
    .addClass( 'Cancelar' );
}

function addListenersCriarLobby() {
  $( '#criarLobbyBtn' ).on( 'click', function () {
    if ( $( '#criarLobbyBtn' ).hasClass( 'Cancelar' ) ) {
      clearInterval( intervalCriarLobby );
      adicionarBotaoForcarCriarLobby();
    } else {
      intervalCriarLobby = intervalerCriacaoLobby();
      adicionarBotaoCancelarCriarLobby();
    }
  } );
}

//Criar lobby: https://github.com/LouisRiverstone/gamersclub-lobby_waiter/ com as modificações por causa do layout novo
function intervalerCriacaoLobby() {
  return setInterval( async () => {
    if ( !$( '.sidebar-titulo.sidebar-sala-titulo' ).text().length ) {
      const lobbies = $( '.LobbiesInfo__expanded > .Tag > .Tag__tagLabel' )[0].innerText.split( '/' )[1];
      const windowVars = retrieveWindowVariables( [ 'LOBBIES_LIMIT' ] );
      const limiteLobby = windowVars.LOBBIES_LIMIT;
      if ( Number( lobbies ) < Number( limiteLobby ) ) {
        //Criar lobby por meio de requisição com AXIOS. ozKcs
        const postData = {
          max_level_to_join: 20,
          min_level_to_join: 0,
          private: true,
          region: 0,
          restriction: 1,
          team: null,
          team_players: [],
          type: 'newRoom',
          vetoes: []
        };
        const criarPost = await axios.post( `https://${ GC_URL }/lobbyBeta/createLobby`, postData );
        if ( criarPost.data.success ) {
          const loadLobby = await axios.post( `https://${ GC_URL }/lobbyBeta/openRoom` );
          if ( loadLobby.data.success ) {
            if ( isFirefox ) {
              window.wrappedJSObject.openLobby();
            } else {
              location.href = 'javascript:openLobby(); void 0';
            }
            setTimeout( async () => {
              //Lobby criada com sucesso e entrado na janela da lobby já
              adicionarBotaoForcarCriarLobby();
              clearInterval( intervalCriarLobby );
            }, 1000 );
          }
        } else {
          if ( criarPost.data.message.includes( 'Anti-cheat' ) || criarPost.data.message.includes( 'banned' ) ) {
            clearInterval( intervalCriarLobby );
            adicionarBotaoForcarCriarLobby();
            alertaMsg( criarPost.data.message );
            return;
          }
        }
      }
    } else {
      adicionarBotaoForcarCriarLobby();
      clearInterval( intervalCriarLobby );
    }
  }, 500 );
}

function alertaMsg( msg ) {
  if ( isFirefox ) {
    window.wrappedJSObject.errorAlert( msg );
  } else {
    location.href = `javascript:errorAlert('${msg}'); void 0`;
  }
}

const autoAceitarReady = mutations =>
  $.each( mutations, ( i, mutation ) => {
    const addedNodes = $( mutation.addedNodes );
    //eslint-disable-next-line
      const selector = "button:contains('Ready')";
    const readyButton = addedNodes.find( selector ).addBack( selector );
    if ( readyButton && readyButton.length && !readyButton.disabled ) {
      setTimeout( () => {
        readyButton[0].click();
        readyButton[0].trigger( 'click' );
      }, 150 );
    }
  } );

function autoAceitarReadySetInterval() {
  setInterval( async () => {
    // eslint-disable-next-line
    const readyButton = $( "button:contains('Ready')" );
    if ( readyButton.length ) {
      setTimeout( () => {
        readyButton[0].click();
        readyButton[0].trigger?.( 'click' );
      }, 150 );
    }
  }, 300 );
}

const autoConcordarTermosRanked = mutations =>
  $.each( mutations, ( i, mutation ) => {
    const addedNodes = $( mutation.addedNodes );
    const selector = '.RankedRules__button';
    const concordarButton = addedNodes.find( selector ).addBack( selector );
    if ( concordarButton && concordarButton.length ) {
      concordarButton[0].click();
    }
  } );

let interval = 1000;
let intervalId;

function addListeners() {
  $( '#autoCompleteBtn' ).on( 'click', function () {
    if ( $( '#autoCompleteBtn' ).hasClass( 'Cancelar' ) ) { // Se já estiver buscando
      clearInterval( intervalId );
      adicionarBotaoAutoComplete();
    } else { // Se não estiver buscando ainda
      if ( !$( '#SidebarSala' ).length ) { // Se não estiver em lobby
        intervalerAutoComplete();
        adicionarBotaoCancelar();
      } else { // Se estiver em lobby e tentar clicar no botão de complete
        alertaMsg( 'Você está em um lobby! Saia para buscar por complete!' );
      }
    }
  } );
}

function adicionarBotaoAutoComplete() {
  if ( !$( '#autoCompleteBtn' ).length ) { // Se precisa criar o botão e adicionar na página
    $( '#gcbooster_botoes' )
      .append( $( '<button/>', {
        'id': 'autoCompleteBtn',
        'class': 'WasdButton',
        'css': { 'background-color': 'orange', 'border-radius': '4px' },
        'type': 'button',
        'text': 'Completar Partida'
      } ) );
    addListeners();
  } else { // Se precisa apenas modificar o botão que já existe
    $( '#autoCompleteBtn' )
      .css( { 'background-color': 'orange', 'border-radius': '4px' } )
      .text( 'Completar Partida' )
      .removeClass( 'Cancelar' );
  }
}

function adicionarBotaoCancelar() {
  $( '#autoCompleteBtn' )
    .css( { 'background-color': 'red', 'border-radius': '4px' } )
    .text( 'Procurando Complete...' )
    .addClass( 'Cancelar' );
}

function intervalerAutoComplete() {
  intervalId = setInterval( function () {
    if ( !$( '#SidebarSala' ).length ) { // Se não estiver em lobby ( acontece quando cria lobby e já está buscando complete )
      interval = randomIntFromInterval( 750, 4750 ); // Escolhe um novo intervalo aleatório entre 1s e 5s
      if ( $( '.scroll-content > li > .btn-actions > a.accept-btn' ).length ) {
        setTimeout( function () { // Espera tempo aleatório entre 1 e 5 segundos
          $( '.scroll-content > li > .btn-actions > a.accept-btn' ).get( 0 ).click();
          $( '#completePlayerModal > div > div.buttons > button.sm-button-accept.btn.btn-success' ).get( 0 ).click();
        }, interval );
      }
    } else {
      clearInterval( intervalId );
      adicionarBotaoAutoComplete();
    }
  }, 250 );
}

function randomIntFromInterval( min, max ) {
  return Math.floor( ( Math.random() * ( max - min + 1 ) ) + min );
}

const mostrarKdr = mutations => {
  $.each( mutations, async ( _, mutation ) => {
    $( mutation.addedNodes )
      .find( 'div.sala-lineup-player' ).addBack( 'div.sala-lineup-player' )
      .each( ( _, element ) => {
        $ ( 'div.sala-lineup-player' ).css( 'min-height', '190px' );
        if ( $( element ).find( 'div.player-placeholder' ).addBack( 'div.player-placeholder' ).length > 0 ) {
          $( element ).find( 'div.sala-lineup-placeholder' ).css( 'height', '100px' );
          $ ( element ).find( 'div.sala-lineup-imagem' ).css( 'margin-top', '23px' );
        } else {
          const title = $( element ).find( 'div.sala-lineup-imagem a[data-jsaction]' ).attr( 'title' );
          if ( $( element ).find( '#gcbooster_kdr' )?.length === 0 ) {
            const lobbyId = $ ( element )[0].parentNode.parentNode.parentNode.parentNode.parentNode.id;
            const kdr = getKdrFromTitle( title );
            $( element )
              .prepend( $( '<div/>',
                {
                  'id': 'gcbooster_kdr',
                  'css': {
                    'width': '45px',
                    'height': '18px',
                    'display': 'flex',
                    'align-items': 'center',
                    'color': 'white',
                    'font-weight': 'bold',
                    'background': kdr <= 2 ? '' :
                      'linear-gradient(135deg, rgba(0,255,222,0.8) 0%, rgba(245,255,0,0.8) 30%, rgba(255,145,0,1) 60%, rgba(166,0,255,0.8) 100%)',
                    'background-color': kdr <= 2 ? levelColor[Math.round( kdr * 10 )] + 'cc' : 'initial'
                  }
                } )
                .append( $( '<span/>', {
                  'id': 'gcbooster_kdr_span',
                  'gcbooster_kdr_lobby': lobbyId,
                  'text': kdr,
                  'kdr': kdr,
                  'css': { 'width': '100%', 'font-size': '10px' }
                } ) ) );
            $( element ).find( 'div.sala-lineup-player' ).append( '<style>.sala-lineup-player:before{top:15px !important;}</style>' );
          }
        }
      } );
  } );
};

function getKdrFromTitle( title ) {
  const regexp = /KDR:\s+(\d+\.\d+)\s/g;
  return Array.from( title.matchAll( regexp ), m => m[1] )[0];
}

const filtrarLobbiesKdr = () => {
  setInterval( () => {
    if ( document.getElementById( 'filtrarKdrInput' ) ) {
      const filtroValue = document.getElementById( 'filtrarKdrInput' ).value;
      $( '#filtrarKdrValor' )[0].textContent = filtroValue > 2.99 ? '3+' : filtroValue;
      $( 'span[gcbooster_kdr_lobby]' ).each( function ( _i, elem ) {
        const lobbyId = elem.getAttribute( 'gcbooster_kdr_lobby' );
        if ( !lobbyId ) { return; }
        const kdrs = [];
        $( `span[gcbooster_kdr_lobby=${lobbyId}]` ).each( function ( _i, elem ) {
          kdrs.push( elem.textContent );
        } );
        if ( filtroValue <= 2.99 && kdrs.find( v => v > filtroValue ) ) {
          document.getElementById( lobbyId ).style.display = 'none';
        } else {
          document.getElementById( lobbyId ).style.display = 'flex';
        }
      } );
    }
  }, 100 );
};

function addCabecalho() {
  $( '<div/>', { 'class': 'FilterLobby_container__fB29J', 'css': { 'margin-top': '10px' } } )
    .append( $( '<div/>', { 'class': 'FilterLobby_main__23Z64', 'id': 'gcbooster_cabecalho', 'css': { 'width': '1050px' } } ) )
    .append( $( '<div/>', { 'class': 'FilterLobby_main__23Z64', 'id': 'gcbooster_info', 'css': { 'display': 'none' } } ) )
    .insertAfter( $( '#lobbyContent > div.row.lobby-rooms-content > div > div' ) );

  $( '#gcbooster_cabecalho' ).append( $( '<div/>', { 'class': 'FilterLobby_section__3UmYp' } )
    .append( $( '<p/>', { 'class': 'FilterLobby_sectionLabel__1zPew', 'text': 'GamersClub Booster', 'css': { 'color': 'orange' } } ) )
    .append( $( '<div/>', { 'class': 'FilterLobby_buttons__2ySGq', 'id': 'gcbooster_botoes' } ) ) );
}

const adicionarFiltroKdr = () => {
  // if ( !$( '#filtrarKdrInput' ).length ) {
    $( '#gcbooster_cabecalho' ).append( $( '<div/>', { 'id': 'gcbooster_section2', 'class': 'FilterLobby_section__3UmYp' } )
      .append( $( '<p/>', { 'class': 'FilterLobby_sectionLabel__1zPew', 'text': 'Filtrar por KDR', 'css': { 'color': 'orange' } } ) )
      .append( $( '<div/>', { 'class': 'FilterLobby_buttons__2ySGq', 'id': 'filtrarKdr' } ) ) );
      console.log('cccc')
    $( '#filtrarKdr' )
      .append( $( '<input/>', {
        id: 'filtrarKdrInput',
        type: 'range',
        min: '0.1',
        max: '3',
        step: '0.1',
        value: 3,
        class: 'filterKdr'
      } ) );
    $( '#filtrarKdr' ).append( '<span id="filtrarKdrValor" class="FilterLobby_skillLevelTag__10iAp">3+</span>' );
  // }

  filtrarLobbiesKdr();
};

const somReady = mutations =>
  $.each( mutations, ( _i, mutation ) => {
    const addedNodes = $( mutation.addedNodes );
    const selector = 'button:contains(\'Ready\')';
    const readyButton = addedNodes.find( selector ).addBack( selector );
    if ( readyButton && readyButton.length && readyButton.text() === 'Ready' && !readyButton.disabled ) {
      const som = 'https://www.myinstants.com/media/sounds/esl-pro-league-season-11-north-america-mibr-vs-furia-mapa-iii-mirage-mp3cut.mp3';
      const audio = new Audio( som );
      const volume = 30;
      audio.volume = volume / 100;
      $( selector ).on( 'click', function () { audio.play(); } );
    }
  } );

const criarObserver = ( seletor, exec ) => {
  if ( $( seletor ).length > 0 ) {
    const observer = new MutationObserver( mutations => {
      exec( mutations );
    } );
    observer.observe( $( seletor ).get( 0 ), {
      childList: true,
      subtree: true,
      attributes: false,
      characterData: false
    } );
  }
};

const initializeLobby = async () => {
  criarObserver( '.lobby,.ranking', somReady );
  criarObserver( '.lobby,.ranking', autoAceitarReady );
  criarObserver( '.lobby,.ranking', autoConcordarTermosRanked );
  criarObserver( '.list-avaliable-teams', mostrarKdr );
  criarObserver( '#challengeList', mostrarKdr );
  console.log('11111')

  // Cria seção de cabeçalho para botões da extensão
  addCabecalho();
  // Clicar automáticamente no Ready, temporário.
  autoAceitarReadySetInterval();
  // Feature para aceitar complete automatico
  adicionarBotaoAutoComplete();
  // Feature pra criar lobby caso full
  adicionarBotaoForcarCriarLobby();
  // Feature para filtrar por KD
  adicionarFiltroKdr();
};

window.addEventListener("load", function() {
  if ( window.location.pathname.includes( 'lobby' ) ) {
    initializeLobby();
  }
} );
