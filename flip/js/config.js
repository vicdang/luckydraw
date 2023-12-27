const config = {
    test_mode: false,
    animation: true,
    show_raw_data: true,
    show_archived: true,
    delay:30000,
    data_file: "data.json",
    remove_team_in_rounds: [1, 2],
    app_name: "Vòng Quay Nhân Phẩm",
    current_year: 2023,
    oraginzation: "DC26",
    main_page_title: "Hành Trình Ngược Gió",
    champion_title: "Thắng Giải",
    sound_effect: {
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
        approve: "pipe.mp3"
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
            skip: [],
        },
        "2": {
            name: "Giải To Bự",
            round: 2,
            max: 2,
            checked: false,
            skip: [2],
        },
        "3": {
            name: "Giải Hơi Bự",
            round: 3,
            max: 3,
            checked: false,
            skip: [4, 3],
        },
        "4": {
            name: "Giải Vui Vui",
            round: 4,
            max: 3,
            checked: true,
            skip: [5],
        }
    }
};