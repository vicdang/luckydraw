const config = {
    test_mode: false,
    animation: true,
    show_raw_data: false,
    show_archived: true,
    delay:30000,
    data_file: "data.json",
    remove_team_in_rounds: [2, 1],
    app_name: "Vòng Quay Nhân Phẩm",
    current_year: 2023,
    oraginzation: "DC26",
    main_page_title: "Vòng Quay Nhân Phẩm",
    champion_title: "Thắng Giải",
    sound_effect: {
        win_roll: "LevelComplete.mp3",
        end_round: "CastleComplete.mp3",
        rolling: ["Underground.mp3", "Underwater.mp3", "Castle.mp3", "Invincibility.mp3", "mario.mp3", "NameEntry.mp3"],
        end_game: "SavedPrincess.mp3",
        approve: "pipe.mp3"
    },
    action_btn: {
        start: "Bắt Đầu",
        add: "Tạo Mới",
        accept: "Chấp Nhận",
        reject: "Từ Chối"
    },
    stage_init: {
        "1": {
            name: "Giải Siêu Phẩm",
            round: 1,
            max: 1,
            checked: false,
        },
        "2": {
            name: "Giải To Bự",
            round: 2,
            max: 2,
            checked: false,
        },
        "3": {
            name: "Giải Hơi Bự",
            round: 3,
            max: 3,
            checked: false,
        },
        "4": {
            name: "Giải Vui Vui",
            round: 4,
            max: 3,
            checked: true,
        }
    }
};