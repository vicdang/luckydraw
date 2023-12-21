const config = {
    animation: true,
    show_raw_data: false,
    show_archived: true,
    remove_team_in_rounds: [2, 1],
    action_btn: {
        start: "Start",
        add: "New",
        accept: "Accept",
        reject: "Reject"
    },
    stage_init: {
        "1": {
            name: "Round 1",
            round: 1,
            max: 1,
            checked: false,
        },
        "2": {
            name: "Round 2",
            round: 2,
            max: 1,
            checked: false,
        },
        "3": {
            name: "Round 3",
            round: 3,
            max: 1,
            checked: false,
        },
        "4": {
            name: "Round KK",
            round: 4,
            max: 1,
            checked: true,
        }
    }
};