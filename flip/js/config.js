const config = {
    test_mode: true,      // Enable test mode, default : false
    animation: false,      // Enable rolling animation, default : true
    show_raw_data: false, // Enable show raw data table, default : false
    show_archived: true,  // Enable show achived result, default : true
    fire_works: true,     // Enable play fire works, default : true
    show_timer: false,    // Enable show timer per roll, default : false
    play_sound: true,     // Enable play sound per roll, default : true
    id_num: 6,
    data_file: "data.json",
    remove_team_in_rounds: [1, 2],
    app_name: "Vòng Quay Nhân Phẩm",
    current_year: 2023,
    oraginzation: "DC26",
    main_page_title: "Hành Trình Ngược Gió",
    champion_title: "Thắng Giải",
    roller: {
        easing: 'swing',
        stopSeq: 'random',
        time: 10000,
        loops: 9,               // Number: times it will spin during the animation
        manualStop: false,      // Boolean: spin until user manually click to stop
        useStopTime: false,     // Boolean: use stop time        
        stopTime: 5000,         // Number: total time of stop aniation
    },
    sound_effect: {
        path: "flip/sound/",
        win_roll: "LevelComplete.mp3",
        end_round: "CastleComplete.mp3",
        rolling: [
            "Underground.mp3", 
            "Underwater.mp3", 
            "Castle.mp3", 
            "Invincibility.mp3", 
            "mario.mp3", 
            "NameEntry.mp3"
        ],
        end_game: "SavedPrincess.mp3",
        approve: "pipe.mp3",
        fireworks: "fireworks.mp3",
        ding: "ding.wav",
    },
    action_btn: {
        start: "Bắt Đầu",
        add: "Bỏ Qua",
        accept: "Chấp Nhận",
        reject: "Từ Chối"
    },
    stage_init: {
        "1": {
            name: "Giải Siêu Phẩm",
            round: 1,
            max: 1,
            checked: false,
            skip: [3],
        },
        "2": {
            name: "Giải To Bự",
            round: 2,
            max: 2,
            checked: false,
            skip: [],
        },
        "3": {
            name: "Giải Hơi Bự",
            round: 3,
            max: 3,
            checked: false,
            skip: [4],
        },
        "4": {
            name: "Giải Vui Vẻ",
            round: 4,
            max: 3,
            checked: true,
            skip: [5],
        }
    }
};