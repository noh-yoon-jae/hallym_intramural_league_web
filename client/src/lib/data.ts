import type { SportType, CollegeType, Game, Notice, Team, College, RankingTeam } from "./types"

//https://emojiguide.org/sports
export const SPORTS_CONFIG = {
    풋살: { icon: "⚽", name: "풋살" },
    피구: { icon: "🤾", name: "피구" },
    축구: { icon: "⚽", name: "축구" },
    야구: { icon: "⚾", name: "야구" },
    소프트볼: { icon: "🥎", name: "소프트볼" },
    농구: { icon: "🏀", name: "농구" },
    배구: { icon: "🏐", name: "배구" },
    미식축구: { icon: "🏈", name: "미식축구" },
    럭비: { icon: "🏉", name: "럭비" },
    테니스: { icon: "🎾", name: "테니스" },
    플라잉디스크: { icon: "🥏", name: "플라잉디스크" },
    크리켓: { icon: "🏏", name: "크리켓" },
    필드하키: { icon: "🏑", name: "필드하키" },
    아이스하키: { icon: "🏒", name: "아이스하키" },
    탁구: { icon: "🏓", name: "탁구" },
    라크로스: { icon: "🥍", name: "라크로스" },
    배드민턴: { icon: "🏸", name: "배드민턴" },
    골프: { icon: "⛳", name: "골프" },
    스키: { icon: "🎿", name: "스키" },
    스노우보드: { icon: "🏂", name: "스노우보드" },
    아이스스케이트: { icon: "⛸️", name: "아이스스케이트" },
    스케이트보드: { icon: "🛹", name: "스케이트보드" },
    달리기: { icon: "🏃", name: "달리기" },
    사이클: { icon: "🚴", name: "사이클" },
    서핑: { icon: "🏄", name: "서핑" },
    수영: { icon: "🏊", name: "수영" },
    수구: { icon: "🤽", name: "수구" },
    핸드볼: { icon: "🤾", name: "핸드볼" },
    곡예: { icon: "🤸", name: "곡예" },
    저글링: { icon: "🤹", name: "저글링" },
    펜싱: { icon: "🤺", name: "펜싱" },
    유도: { icon: "🥋", name: "유도" },
    권투: { icon: "🥊", name: "권투" },
    웨이트리프팅: { icon: "🏋", name: "웨이트리프팅" },
    양궁: { icon: "🏹", name: "양궁" },
    컬링: { icon: "🥌", name: "컬링" },
} as const ;

export const COLLEGES: Record<CollegeType, College> = {
    공과대학: {
        name: "공과대학",
        logo: "🔧",
        color: "bg-blue-100 text-blue-800",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        slogan: "기술과 열정으로 승리를!",
        description: "공학의 정밀함과 체계적인 전략으로 경기에 임하는 공과대학 스포츠팀입니다.",
        founded: "2020",
        contact: {
            phone: "02-1234-5678",
            email: "sports@engineering.ac.kr",
            location: "공과대학 학생회관 2층",
        },
        achievements: ["2023년 종합 우승", "축구 3년 연속 우승", "농구 준우승 2회"],
    },
    간호대학: {
        name: "간호대학",
        logo: "🏥",
        color: "bg-green-100 text-green-800",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        slogan: "치유의 마음으로 승부하자!",
        description: "케어 정신과 팀워크를 바탕으로 한 간호대학의 강력한 스포츠팀입니다.",
        founded: "2019",
        contact: {
            phone: "02-1234-5679",
            email: "sports@nursing.ac.kr",
            location: "간호대학 학생라운지",
        },
        achievements: ["배구 2년 연속 우승", "테니스 우승 1회", "종합 준우승 1회"],
    },
    자연과학대학: {
        name: "자연과학대학",
        logo: "🧪",
        color: "bg-purple-100 text-purple-800",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200",
        slogan: "과학적 분석으로 완벽한 승리!",
        description: "과학적 사고와 데이터 분석을 통한 전략적 경기 운영이 특징입니다.",
        founded: "2020",
        contact: {
            phone: "02-1234-5680",
            email: "sports@science.ac.kr",
            location: "자연과학대학 학생회실",
        },
        achievements: ["농구 우승 2회", "야구 우승 1회", "개인 MVP 다수 배출"],
    },
    경영대학: {
        name: "경영대학",
        logo: "💼",
        color: "bg-orange-100 text-orange-800",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
        slogan: "전략적 사고로 승리를 경영하다!",
        description: "체계적인 전략과 리더십으로 경기를 이끌어가는 경영대학 스포츠팀입니다.",
        founded: "2019",
        contact: {
            phone: "02-1234-5681",
            email: "sports@business.ac.kr",
            location: "경영대학 학생회관 3층",
        },
        achievements: ["야구 3년 연속 우승", "축구 준우승 2회", "최우수 팀워크상 수상"],
    },
    인문대학: {
        name: "인문대학",
        logo: "📚",
        color: "bg-red-100 text-red-800",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        slogan: "인문학적 감성으로 스포츠를 예술로!",
        description: "창의적 사고와 예술적 감각을 스포츠에 접목시킨 독특한 팀입니다.",
        founded: "2021",
        contact: {
            phone: "02-1234-5682",
            email: "sports@humanities.ac.kr",
            location: "인문대학 도서관 별관",
        },
        achievements: ["페어플레이상 3회 수상", "배구 준우승 1회", "신인상 다수 배출"],
    },
}

export const COLLEGE_TEAMS: Record<CollegeType, Record<string, Team[]>> = {
    공과대학: {
        축구: [
            { name: "슈팅스타즈", englishName: "Shooting Stars", logo: "⭐", color: "bg-yellow-100 text-yellow-800" },
            { name: "FC 스트라이커즈", englishName: "Strikers", logo: "⚡", color: "bg-red-100 text-red-800" },
            { name: "골든부츠", englishName: "Golden Boots", logo: "👑", color: "bg-amber-100 text-amber-800" },
            { name: "블랙이글스", englishName: "Black Eagles", logo: "🦅", color: "bg-gray-100 text-gray-800" },
            { name: "사커파이어", englishName: "Soccer Fire", logo: "🔥", color: "bg-orange-100 text-orange-800" },
        ],
        농구: [
            { name: "레드울브즈", englishName: "Red Wolves", logo: "🐺", color: "bg-red-100 text-red-800" },
            { name: "파워킥스", englishName: "Power Kicks", logo: "💪", color: "bg-blue-100 text-blue-800" },
            { name: "블루타이거즈", englishName: "Blue Tigers", logo: "🐅", color: "bg-blue-100 text-blue-800" },
        ],
        배구: [
            { name: "FC 다이나모", englishName: "Dynamo", logo: "⚡", color: "bg-green-100 text-green-800" },
            { name: "썬더볼트", englishName: "Thunderbolt", logo: "⚡", color: "bg-purple-100 text-purple-800" },
        ],
    },
    간호대학: {
        축구: [
            { name: "화이트엔젤스", englishName: "White Angels", logo: "👼", color: "bg-green-100 text-green-800" },
            { name: "케어FC", englishName: "Care FC", logo: "💚", color: "bg-emerald-100 text-emerald-800" },
            { name: "힐러즈", englishName: "Healers", logo: "🏥", color: "bg-teal-100 text-teal-800" },
        ],
        농구: [
            { name: "메디컬샷", englishName: "Medical Shot", logo: "💉", color: "bg-green-100 text-green-800" },
            { name: "나이팅게일", englishName: "Nightingale", logo: "🕊️", color: "bg-sky-100 text-sky-800" },
        ],
        배구: [
            { name: "하트비트", englishName: "Heartbeat", logo: "💓", color: "bg-pink-100 text-pink-800" },
            { name: "라이프세이버", englishName: "Lifesaver", logo: "🛟", color: "bg-cyan-100 text-cyan-800" },
        ],
    },
    자연과학대학: {
        축구: [
            { name: "사이언스FC", englishName: "Science FC", logo: "🧪", color: "bg-purple-100 text-purple-800" },
            { name: "아톰킥커즈", englishName: "Atom Kickers", logo: "⚛️", color: "bg-indigo-100 text-indigo-800" },
            { name: "랩스타즈", englishName: "Lab Stars", logo: "🔬", color: "bg-violet-100 text-violet-800" },
        ],
        농구: [
            { name: "퀀텀점프", englishName: "Quantum Jump", logo: "🌌", color: "bg-purple-100 text-purple-800" },
            { name: "몰레큘러", englishName: "Molecular", logo: "🧬", color: "bg-blue-100 text-blue-800" },
        ],
        배구: [
            { name: "그래비티", englishName: "Gravity", logo: "🌍", color: "bg-green-100 text-green-800" },
            { name: "일렉트론", englishName: "Electron", logo: "⚡", color: "bg-yellow-100 text-yellow-800" },
        ],
    },
    경영대학: {
        축구: [
            { name: "비즈니스FC", englishName: "Business FC", logo: "💼", color: "bg-orange-100 text-orange-800" },
            { name: "CEO킥커즈", englishName: "CEO Kickers", logo: "👔", color: "bg-slate-100 text-slate-800" },
            { name: "프로핏", englishName: "Profit", logo: "💰", color: "bg-green-100 text-green-800" },
        ],
        농구: [
            { name: "매니지먼트", englishName: "Management", logo: "📊", color: "bg-blue-100 text-blue-800" },
            { name: "스트래티지", englishName: "Strategy", logo: "🎯", color: "bg-red-100 text-red-800" },
        ],
        배구: [
            { name: "마케팅팀", englishName: "Marketing", logo: "📈", color: "bg-pink-100 text-pink-800" },
            { name: "이노베이션", englishName: "Innovation", logo: "💡", color: "bg-yellow-100 text-yellow-800" },
        ],
    },
    인문대학: {
        축구: [
            { name: "아르테FC", englishName: "Arte FC", logo: "🎨", color: "bg-red-100 text-red-800" },
            { name: "포에트리", englishName: "Poetry", logo: "📝", color: "bg-purple-100 text-purple-800" },
            { name: "클래식", englishName: "Classic", logo: "📚", color: "bg-amber-100 text-amber-800" },
        ],
        농구: [
            { name: "뮤즈", englishName: "Muse", logo: "🎭", color: "bg-pink-100 text-pink-800" },
            { name: "하모니", englishName: "Harmony", logo: "🎵", color: "bg-indigo-100 text-indigo-800" },
        ],
        배구: [
            { name: "크리에이티브", englishName: "Creative", logo: "✨", color: "bg-purple-100 text-purple-800" },
            { name: "인스피어", englishName: "Inspire", logo: "💫", color: "bg-blue-100 text-blue-800" },
        ],
    },
}

export const ALL_TEAMS: Team[] = Object.values(COLLEGE_TEAMS)
    .flatMap((sports) => Object.values(sports).flat())

export const ACTIVE_SPORTS: SportType[] = ["축구", "농구", "배구", "야구", "테니스"]

export const CHEER_EMOJIS = ["🔥", "💪", "👏", "🎉", "⚡", "🌟", "❤️", "👍"]

export const RANKINGS_DATA: Record<SportType, RankingTeam[]> = {
    축구: [
        { rank: 1, team: "공과대학", wins: 7, losses: 1, points: 22, logo: "🔧" },
        { rank: 2, team: "자연과학대학", wins: 5, losses: 3, points: 17, logo: "🧪" },
        { rank: 3, team: "간호대학", wins: 4, losses: 4, points: 15, logo: "🏥" },
        { rank: 4, team: "경영대학", wins: 3, losses: 5, points: 11, logo: "💼" },
    ],
    농구: [
        { rank: 1, team: "자연과학대학", wins: 7, losses: 1, points: 21, logo: "🧪" },
        { rank: 2, team: "공과대학", wins: 6, losses: 2, points: 18, logo: "🔧" },
        { rank: 3, team: "경영대학", wins: 5, losses: 3, points: 15, logo: "💼" },
        { rank: 4, team: "간호대학", wins: 3, losses: 5, points: 9, logo: "🏥" },
    ],
    배구: [
        { rank: 1, team: "간호대학", wins: 6, losses: 2, points: 19, logo: "🏥" },
        { rank: 2, team: "공과대학", wins: 5, losses: 3, points: 17, logo: "🔧" },
        { rank: 3, team: "자연과학대학", wins: 4, losses: 4, points: 13, logo: "🧪" },
        { rank: 4, team: "경영대학", wins: 2, losses: 6, points: 8, logo: "💼" },
    ],
    야구: [
        { rank: 1, team: "경영대학", wins: 8, losses: 0, points: 24, logo: "💼" },
        { rank: 2, team: "공과대학", wins: 6, losses: 2, points: 18, logo: "🔧" },
        { rank: 3, team: "자연과학대학", wins: 3, losses: 5, points: 9, logo: "🧪" },
        { rank: 4, team: "간호대학", wins: 1, losses: 7, points: 3, logo: "🏥" },
    ],
    테니스: [
        { rank: 1, team: "간호대학", wins: 7, losses: 1, points: 21, logo: "🏥" },
        { rank: 2, team: "자연과학대학", wins: 5, losses: 3, points: 15, logo: "🧪" },
        { rank: 3, team: "경영대학", wins: 4, losses: 4, points: 12, logo: "💼" },
        { rank: 4, team: "공과대학", wins: 2, losses: 6, points: 6, logo: "🔧" },
    ],
    탁구: [],
    수영: [],
    배드민턴: [],
}

export const SAMPLE_GAMES: Game[] = [
    {
        id: 1,
        sport: "축구",
        team1: "공과대학",
        team2: "간호대학",
        score: "3-1",
        date: "2024-01-15",
        winner: "공과대학",
    },
    {
        id: 2,
        sport: "농구",
        team1: "자연과학대학",
        team2: "경영대학",
        score: "78-65",
        date: "2024-01-14",
        winner: "자연과학대학",
    },
]

export const SAMPLE_NOTICES: Notice[] = [
    {
        id: 1,
        title: "🏆 2024년 단과대학 스포츠 리그 개막식 안내",
        content:
            "2024년 단과대학 스포츠 리그 개막식이 1월 25일(목) 오후 2시에 대강당에서 열립니다. 모든 학생들의 많은 참여 바랍니다.",
        date: "2024-01-18",
        category: "행사",
        important: true,
        author: "스포츠센터",
        views: 1247,
    },
    {
        id: 2,
        title: "⚽ 축구 경기장 보수공사로 인한 일정 변경",
        content:
            "축구 경기장 잔디 보수공사로 인해 1월 22일~24일 축구 경기가 연기됩니다. 자세한 일정은 추후 공지하겠습니다.",
        date: "2024-01-17",
        category: "일정변경",
        important: false,
        author: "경기운영팀",
        views: 892,
    },
]
