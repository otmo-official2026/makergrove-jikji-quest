/*
 * 코스 데이터 (SYS-01)
 * 이 파일만 바꾸면 다른 코스가 된다. 화면 코드는 이 값만 읽는다.
 * 영상(video) 칸: 파일을 넣으면 그 영상을 재생하고, 파일이 없거나 3초 안에 열리지 않으면
 * 같은 내용을 그림·애니메이션으로 대신 보여 준다.
 * 이미지(image) 칸: 영상이 없을 때 이 그림을 쓴다. 그림도 열리지 않으면 그림·애니메이션으로 돌아간다.
 * 이야기 그림 여러 장(images): 있으면 image 대신 쓰고, 자막이 넘어가는 동안 고르게 나눠 바꾼다(자막 6장·그림 3장 → 2장마다).
 * 활동 그림(game.image): 있으면 활동 화면에서 그림(art) 대신 보여 준다. 열리지 않으면 그림(art)으로.
 * 자막(captions)의 " / "는 줄바꿈이다. 화면에서도 그 자리에서 끊는다.
 * 활자의 기억(memory): 활자를 잡은 직후, 단계 성적표, 활자 보관함에 나오는 한 줄.
 */
window.COURSE = {
  id: 'jikji-01',
  platform: '청주 지역문화자원을 활용한 증강현실 체험교육플랫폼',
  operator: '메이커그로브 사회적협동조합',
  title: '사라진 활자를 찾아라',
  subtitle: '직지의 도시 청주, 6개의 장소',
  minutes: 120,
  answer: '직지심체요절',

  opening: {
    video: 'assets/video/opening.mp4',
    image: 'assets/img/story_opening.jpg',
    captions: [
      '1377년 7월, 청주 흥덕사.',
      '스님들이 쇠를 녹여 / 글자를 만들었다.',
      '그 활자로 찍은 책, 직지.',
      '그런데 활자 여섯 자가 / 사라졌다.',
    ],
    skipAfter: 5,
  },

  intro: [
    { art: 'mission', image: 'assets/img/card_mission.jpg', title: '여섯 자를 되찾아라', body: ['장소마다 퀘스트를 끝내면', '활자 한 자를 얻습니다'] },
    { art: 'scores', image: 'assets/img/card_scores.jpg', title: '점수는 세 가지', body: ['빨리 끝내면 속도, 잘하면 성적', '운이 좋으면 행운 점수'] },
    { art: 'awards', image: 'assets/img/card_awards.jpg', title: '끝나면 시상식', body: ['종합 1~3위와 부문상,', '전원에게 랜덤 보상'] },
  ],

  join: {
    schools: ['한빛초등학교', '새솔중학교', '가람중학교'],
    grades: [1, 2, 3, 4, 5, 6],
    classes: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    teams: 6,
    terms: {
      required: {
        label: '(필수) 개인정보 수집·이용',
        title: '개인정보 수집·이용 동의 (필수)',
        items: '이름, 연락처, 학교, 학년·반, 조',
        purpose: '참가자 식별, 프로그램 운영, 보상 지급',
        keep: '프로그램 종료 후 ○개월',
      },
      optional: {
        label: '(선택) 프로그램 소식 받기',
        title: '프로그램 소식 받기 동의 (선택)',
        items: '연락처',
        purpose: '프로그램 소식 안내',
        keep: '동의 철회 시까지',
      },
      refuse: '동의를 거부할 수 있습니다. 필수 항목에 동의하지 않으면 참가 등록이 되지 않고, 선택 항목은 동의하지 않아도 참가할 수 있습니다.',
      draft: '문구는 임시안이며 본 개발 전에 법률 검토를 받습니다.',
    },
  },

  // 속도 점수: 그 단계 완료 순서의 상위 비율 (4.1)
  speedTiers: [
    { top: 0.1, points: 30 },
    { top: 0.3, points: 25 },
    { top: 0.5, points: 20 },
    { top: 0.7, points: 15 },
    { top: 1.0, points: 10 },
  ],

  stages: [
    {
      no: 1,
      place: '직지문화특구 입구',
      art: 'plaza',
      image: 'assets/img/place_plaza.jpg',
      code: 'GJ1-7QK',
      letter: '요', hanja: '要',
      memory: '직지는 "마음을 곧바로 가리킨다"는 뜻이다.',
      story: {
        video: 'assets/video/story_1.mp4',
        image: 'assets/img/story_tools.jpg',
        images: ['assets/img/story_tools.jpg', 'assets/img/story_desk.jpg', 'assets/img/story_case.jpg'],
        scene: 'tools',
        captions: [
          '오늘 너희는 / 수습 각자장이다.',
          '각자장은 / 글자를 새기는 장인.',
          '직지의 진짜 이름은 / 백운화상초록불조직지심체요절.',
          '백운 스님이 1372년에 엮은 / 옛 스승들의 가르침이다.',
          '줄여서 직지. / 마음을 곧바로 가리킨다는 뜻.',
          '활자 여섯 자를 되찾아 / 책을 완성하라.',
        ],
      },
      quest: { name: '각자장의 구호', rules: ['조 구호를 정한다', '다 함께 외친다', '요원이 확인한다'] },
      game: {
        type: 'activity',
        art: 'chant',
        image: 'assets/img/game_chant.jpg',
        lines: ['조 구호를 다 함께 외치세요', '끝나면 요원에게 확인받습니다'],
        points: 20,
      },
      max: { speed: 30, grade: 20, luck: 0 },
      result: { video: 'assets/video/result_stamp.mp4', scene: 'stamp', text: '통과! 성적 +{grade}' },
    },
    {
      no: 2,
      place: '흥덕사지',
      art: 'temple',
      image: 'assets/img/place_temple.jpg',
      code: 'HD2-4MZ',
      letter: '심', hanja: '心',
      memory: '1985년, "흥덕사"가 새겨진 청동 쇠북이 나왔다.',
      story: {
        video: 'assets/video/story_2.mp4',
        image: 'assets/img/story_temple.jpg',
        images: ['assets/img/story_temple.jpg', 'assets/img/story_gong.jpg', 'assets/img/story_dawn.jpg'],
        scene: 'temple',
        captions: [
          '여기가 흥덕사 터.',
          '1377년, 이곳에서 / 금속활자로 직지를 찍었다.',
          '절은 사라지고 / 자리마저 잊혔다.',
          '1985년, 집터를 닦던 땅에서 / 청동 쇠북이 나왔다.',
          '거기 새겨진 세 글자, / 흥덕사.',
          '그렇게 직지의 고향을 / 되찾았다.',
        ],
      },
      quest: { name: '흥덕사의 주사위', rules: ['주사위를 굴린다', '나온 눈을 입력한다', '눈이 클수록 점수가 크다'] },
      game: {
        type: 'dice',
        question: '주사위 눈이 몇인가요?',
        perPip: 15,
      },
      max: { speed: 30, grade: 0, luck: 90 },
      result: { video: 'assets/video/dice_{value}.mp4', scene: 'dice', text: '행운 +{luck}' },
    },
    {
      no: 3,
      place: '청주고인쇄박물관',
      art: 'museum',
      image: 'assets/img/place_museum.jpg',
      code: 'GI3-9TR',
      letter: '절', hanja: '節',
      memory: '직지 원본은 하권 한 책, 프랑스국립도서관에 있다.',
      story: {
        video: 'assets/video/story_3.mp4',
        image: 'assets/img/story_showcase.jpg',
        images: ['assets/img/story_showcase.jpg', 'assets/img/story_trunk.jpg', 'assets/img/story_library.jpg'],
        scene: 'showcase',
        captions: [
          '금속활자로 찍은 책 가운데 / 지금 남아 있는 가장 오래된 책.',
          '그런데 직지는 / 여기에 없다.',
          '두 권 중 하권 한 책만 남아 / 프랑스국립도서관에 있다.',
          '19세기 말, 프랑스 외교관 / 플랑시가 구해 간 책이다.',
          '1972년 파리 전시에서 / 박병선 박사가 세상에 알렸다.',
          '이곳의 직지는 / 똑같이 되살린 복원본이다.',
        ],
      },
      quest: { name: '전시실의 세 문제', rules: ['전시실에서 답을 찾는다', '세 문제를 푼다', '틀리면 점수가 깎인다'] },
      game: {
        type: 'quiz',
        perQuestion: 20,
        penalty: 5,
        floor: 5,
        questions: [
          { q: '직지를 금속활자로 찍어 낸 해는?', options: ['1234년', '1377년', '1443년', '1592년'], answer: 1, note: '고려 우왕 3년 7월이다' },
          { q: '지금 남아 있는 직지는?', options: ['상권', '하권', '상·하권 모두', '남아 있지 않다'], answer: 1, note: '상권은 전하지 않는다' },
          { q: '직지 원본이 있는 곳은?', options: ['청주고인쇄박물관', '국립중앙박물관', '프랑스국립도서관', '영국도서관'], answer: 2, note: '1950년에 기증받아 보관하고 있다' },
        ],
      },
      max: { speed: 30, grade: 60, luck: 0 },
      result: { video: 'assets/video/result_book.mp4', scene: 'book', text: '성적 +{grade}' },
    },
    {
      no: 4,
      place: '금속활자전수교육관',
      art: 'foundry',
      image: 'assets/img/place_foundry.jpg',
      code: 'JS4-2HX',
      letter: '지', hanja: '指',
      memory: '밀랍으로 빚고 쇳물을 부어 활자를 만든다.',
      story: {
        video: 'assets/video/story_4.mp4',
        image: 'assets/img/story_pour.jpg',
        images: ['assets/img/story_waxtree.jpg', 'assets/img/story_pour.jpg', 'assets/img/story_typetree.jpg'],
        scene: 'pour',
        captions: [
          '활자 한 자는 / 이렇게 태어난다.',
          '밀랍에 글자를 새기고 / 가지처럼 이어 붙인다.',
          '흙으로 감싸 구우면 / 밀랍은 녹아 빠진다.',
          '그 빈자리에 / 쇳물을 붓는다.',
          '틀을 깨면 / 가지 끝마다 활자가 열린다.',
          '이 기술을 잇는 장인이 / 국가무형유산 금속활자장이다.',
        ],
      },
      quest: { name: '운명의 복불복', rules: ['쪽지를 하나 뽑는다', '결과를 입력한다', '꽝이면 벌칙이 있다'] },
      game: {
        type: 'lottery',
        question: '뽑은 쪽지는?',
        win: 90, lose: 0, afterPenalty: 30,
      },
      max: { speed: 30, grade: 0, luck: 90 },
      result: {
        win: { video: 'assets/video/lottery_win.mp4', scene: 'boxWin', text: '당첨! 행운 +{luck}' },
        lose: { video: 'assets/video/lottery_lose.mp4', scene: 'boxLose', text: '꽝… 벌칙이 기다린다' },
      },
    },
    {
      no: 5,
      place: '근현대인쇄전시관',
      art: 'press',
      image: 'assets/img/place_press.jpg',
      code: 'GH5-6WD',
      letter: '체', hanja: '體',
      memory: '1876년 개항 뒤 납활자와 인쇄기가 들어왔다.',
      story: {
        video: 'assets/video/story_5.mp4',
        image: 'assets/img/story_machine.jpg',
        images: ['assets/img/story_machine.jpg', 'assets/img/story_typewriter.jpg', 'assets/img/story_printer3d.jpg'],
        scene: 'machine',
        captions: [
          '활자는 기계가 되고 / 기계는 세상을 바꿨다.',
          '1876년 개항 뒤 / 납으로 만든 활자가 들어왔다.',
          '신문이 찍혀 나왔다. / 1898년 황성신문.',
          '1949년에는 / 한글 타자기가 나왔다.',
          '글자를 하나씩 골라 판을 짜는 일은 / 직지 때와 같았다.',
          '지금은 3D 프린터가 / 입체까지 찍어 낸다.',
        ],
      },
      quest: { name: '몸으로 말해요', rules: ['조원이 몸으로 설명한다', '2분 동안 맞힌다', '맞힌 개수를 입력한다'] },
      game: {
        type: 'count',
        question: '몇 개 맞혔나요?',
        min: 0, max: 10, perItem: 5,
      },
      max: { speed: 30, grade: 50, luck: 0 },
      result: { video: 'assets/video/result_count.mp4', scene: 'count', text: '{value}개! 성적 +{grade}' },
    },
    {
      no: 6,
      place: '유네스코 국제기록유산센터',
      art: 'center',
      image: 'assets/img/place_center.jpg',
      code: 'UN6-8PB',
      letter: '직', hanja: '直',
      memory: '2001년, 직지는 세계기록유산이 됐다.',
      story: {
        video: 'assets/video/story_6.mp4',
        image: 'assets/img/story_world.jpg',
        images: ['assets/img/story_world.jpg', 'assets/img/story_medal.jpg', 'assets/img/story_archive.jpg'],
        scene: 'world',
        captions: [
          '2001년 9월 4일, / 직지는 세계기록유산이 됐다.',
          '구텐베르크 성서보다 / 78년 앞선 책.',
          '유네스코는 기록을 지킨 이에게 / 직지상을 준다.',
          '2023년, 직지의 고향에 / 국제기록유산센터가 문을 열었다.',
          '세계의 기록을 / 지키는 곳이다.',
          '이제 마지막 활자를 / 찾을 차례.',
        ],
      },
      quest: { name: '마지막 활자', rules: ['다 함께 뛰어 사진을 찍는다', '요원이 확인한다', '활자 여섯 자를 바로 놓는다'] },
      game: {
        type: 'final',
        art: 'jump',
        image: 'assets/img/game_jump.jpg',
        lines: ['다 함께 뛰어 사진을 찍으세요', '끝나면 요원에게 확인받습니다'],
        photoPoints: 20,
        arrange: { title: '여섯 자를 바로 놓으세요', points: 30, penalty: 10, floor: 10 },
      },
      max: { speed: 30, grade: 50, luck: 0 },
      result: { video: 'assets/video/result_merge.mp4', scene: 'merge', text: '완성! 성적 +{grade}' },
    },
  ],

  // 꽝일 때 하나를 무작위로 보여 준다 (C-07)
  penalties: [
    ['조원 전원이 10초 동안', '인쇄기 동작을 흉내 낸다'],
    ['조원 전원이 한 줄로 서서', '"직지심체요절"을 다섯 번 외친다'],
    ['조원 전원이 10초 동안', '쇳물을 붓는 각자장이 된다'],
    ['조원끼리 몸으로', '활자 한 자를 만들어 보인다'],
    ['조원 전원이 10초 동안', '먹을 가는 흉내를 낸다'],
  ],
  penaltyReward: '끝내면 행운 +30',

  awards: [
    { id: 'team', name: '우승 조', by: 'team', line: '조 종합 {score}점', prize: '우승 조 상품' },
    { id: 'luck', name: '행운상', by: 'luck', line: '행운 점수 {score}점', prize: '행운상 상품' },
    { id: 'grade', name: '실력상', by: 'grade', line: '성적 점수 {score}점', prize: '실력상 상품' },
    { id: 'speed', name: '스피드상', by: 'speed', line: '속도 점수 {score}점', prize: '스피드상 상품' },
    { id: 'top3', name: '종합 3위', by: 'total', place: 3, line: '종합 {score}점', prize: '종합 3위 상품' },
    { id: 'top2', name: '종합 2위', by: 'total', place: 2, line: '종합 {score}점', prize: '종합 2위 상품' },
    { id: 'top1', name: '종합 1위', by: 'total', place: 1, line: '종합 {score}점', prize: '종합 1위 상품' },
  ],
  awardVideo: 'assets/video/trophy.mp4',

  lucky: {
    video: 'assets/video/chest.mp4',
    items: [
      { name: '직지 활자 열쇠고리', chance: 10, stock: 3 },
      { name: '활자 스티커 세트', chance: 30, stock: 9 },
      { name: '간식 교환권', chance: 60, stock: 18 },
    ],
  },

  // 가상 참가자 수준 (시연 도구 DEMO-04). 시간 배율과 결과 보정.
  levels: {
    easy: { label: '쉬움', time: 1.35, dice: -1, quiz: 1, count: -2, final: 1 },
    normal: { label: '보통', time: 1, dice: 0, quiz: 0, count: 0, final: 0 },
    hard: { label: '어려움', time: 0.72, dice: 1, quiz: -1, count: 2, final: -1 },
  },

  // 가상 참가자 29명 (RANK-05). t = 단계별 게임 시간(초), 나머지는 각 게임의 결과.
  virtual: [
    { no: '13', team: 1, name: '권서윤', t: [68, 90, 521, 132, 198, 201], dice: 4, quiz: [0, 2, 0], lottery: 'lose', count: 5, final: 2 },
    { no: '27', team: 1, name: '권민준', t: [86, 82, 238, 66, 165, 109], dice: 2, quiz: [1, 0, 0], lottery: 'win', count: 5, final: 1 },
    { no: '22', team: 1, name: '장지우', t: [132, 61, 173, 239, 144, 237], dice: 6, quiz: [0, 1, 0], lottery: 'lose', count: 6, final: 2 },
    { no: '20', team: 1, name: '송하준', t: [112, 28, 179, 181, 165, 149], dice: 6, quiz: [0, 1, 0], lottery: 'lose', count: 5, final: 0 },
    { no: '14', team: 1, name: '안서연', t: [136, 103, 332, 239, 202, 100], dice: 2, quiz: [1, 0, 2], lottery: 'lose', count: 3, final: 1 },
    { no: '18', team: 2, name: '최도윤', t: [87, 56, 200, 74, 174, 177], dice: 4, quiz: [0, 2, 0], lottery: 'win', count: 6, final: 1 },
    { no: '30', team: 2, name: '송하은', t: [147, 97, 337, 191, 181, 177], dice: 4, quiz: [2, 0, 1], lottery: 'lose', count: 5, final: 0 },
    { no: '04', team: 2, name: '장시우', t: [95, 50, 327, 184, 212, 116], dice: 2, quiz: [2, 1, 1], lottery: 'lose', count: 4, final: 1 },
    { no: '11', team: 2, name: '한지호', t: [93, 106, 537, 206, 172, 172], dice: 3, quiz: [0, 0, 0], lottery: 'lose', count: 6, final: 0 },
    { no: '24', team: 2, name: '최수아', t: [116, 96, 350, 138, 152, 157], dice: 5, quiz: [2, 0, 1], lottery: 'lose', count: 5, final: 0 },
    { no: '01', team: 3, name: '안예준', t: [113, 58, 290, 68, 195, 191], dice: 4, quiz: [0, 0, 1], lottery: 'win', count: 7, final: 1 },
    { no: '19', team: 3, name: '신지민', t: [107, 61, 426, 71, 194, 237], dice: 2, quiz: [0, 1, 0], lottery: 'win', count: 4, final: 2 },
    { no: '03', team: 3, name: '오유나', t: [79, 72, 328, 90, 184, 185], dice: 1, quiz: [1, 0, 2], lottery: 'win', count: 3, final: 1 },
    { no: '05', team: 3, name: '박건우', t: [94, 107, 398, 214, 144, 239], dice: 2, quiz: [0, 1, 0], lottery: 'lose', count: 5, final: 0 },
    { no: '17', team: 4, name: '정채원', t: [90, 32, 249, 181, 195, 116], dice: 1, quiz: [0, 0, 1], lottery: 'lose', count: 6, final: 0 },
    { no: '16', team: 4, name: '임우진', t: [29, 54, 181, 152, 183, 83], dice: 5, quiz: [0, 2, 0], lottery: 'lose', count: 5, final: 0 },
    { no: '10', team: 4, name: '이다은', t: [126, 64, 139, 64, 207, 44], dice: 3, quiz: [0, 0, 1], lottery: 'win', count: 9, final: 2 },
    { no: '29', team: 4, name: '김현우', t: [66, 109, 328, 80, 174, 112], dice: 4, quiz: [0, 2, 0], lottery: 'win', count: 6, final: 0 },
    { no: '02', team: 4, name: '신소율', t: [96, 102, 282, 141, 224, 167], dice: 5, quiz: [1, 0, 0], lottery: 'lose', count: 7, final: 1 },
    { no: '12', team: 5, name: '황준서', t: [69, 104, 165, 153, 177, 77], dice: 1, quiz: [0, 2, 1], lottery: 'lose', count: 4, final: 0 },
    { no: '15', team: 5, name: '한윤서', t: [79, 76, 143, 133, 140, 172], dice: 6, quiz: [0, 1, 0], lottery: 'lose', count: 6, final: 0 },
    { no: '25', team: 5, name: '한태윤', t: [147, 56, 336, 134, 193, 255], dice: 1, quiz: [0, 0, 1], lottery: 'lose', count: 2, final: 2 },
    { no: '23', team: 5, name: '박가은', t: [42, 35, 190, 53, 178, 62], dice: 3, quiz: [1, 0, 0], lottery: 'win', count: 6, final: 0 },
    { no: '21', team: 5, name: '송민재', t: [151, 55, 306, 168, 142, 188], dice: 6, quiz: [1, 0, 0], lottery: 'lose', count: 3, final: 2 },
    { no: '28', team: 6, name: '장나연', t: [120, 71, 521, 90, 208, 243], dice: 1, quiz: [0, 2, 2], lottery: 'win', count: 9, final: 0 },
    { no: '26', team: 6, name: '강승현', t: [118, 28, 327, 41, 197, 132], dice: 1, quiz: [0, 1, 0], lottery: 'win', count: 3, final: 1 },
    { no: '09', team: 6, name: '신예린', t: [141, 104, 456, 44, 160, 76], dice: 4, quiz: [0, 0, 1], lottery: 'win', count: 5, final: 1 },
    { no: '06', team: 6, name: '임주원', t: [126, 92, 398, 147, 170, 63], dice: 1, quiz: [0, 0, 1], lottery: 'lose', count: 7, final: 1 },
    { no: '08', team: 6, name: '정하린', t: [77, 73, 153, 167, 197, 52], dice: 3, quiz: [0, 0, 2], lottery: 'lose', count: 5, final: 0 },
  ],

  // 시연 도구 "단계 이동"이 앞 단계를 채울 때 쓰는 기록 (02_유저플로우 9장 예시와 같은 입력)
  demoFill: {
    t: [43, 62, 174, 185, 175, 45],
    dice: 5, quiz: [1, 0, 0], lottery: 'lose', count: 8, final: 0,
  },
};
