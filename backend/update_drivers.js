const mongoose = require('mongoose');
require('dotenv').config();

const getWrapper = (type) => {
    if (type === 'string') {
        return {
            js: `const fs = require('fs');\nconst input = fs.readFileSync('/dev/stdin', 'utf-8').trim();\nconst res = solution(input);\nconsole.log(res);`,
            cpp: `#include <iostream>\n#include <string>\nusing namespace std;\nint main() {\n  string s;\n  getline(cin, s);\n  cout << solution(s) << endl;\n  return 0;\n}`,
            java: `import java.util.*;\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    String s = sc.nextLine();\n    Solution sol = new Solution();\n    System.out.println(sol.solution(s));\n  }\n}`
        };
    } else if (type === 'int') {
        return {
            js: `const fs = require('fs');\nconst input = parseInt(fs.readFileSync('/dev/stdin', 'utf-8').trim());\nconst res = solution(input);\nconsole.log(res);`,
            cpp: `#include <iostream>\nusing namespace std;\nint main() {\n  int n;\n  cin >> n;\n  cout << solution(n) << endl;\n  return 0;\n}`,
            java: `import java.util.*;\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    int n = sc.nextInt();\n    Solution sol = new Solution();\n    System.out.println(sol.solution(n));\n  }\n}`
        };
    } else if (type === 'array') {
        return {
            js: `const fs = require('fs');\nconst lines = fs.readFileSync('/dev/stdin', 'utf-8').trim().split('\\n');\nif(lines.length > 1) {\n  const arr = lines[1].trim().split(' ').map(Number);\n  console.log(solution(arr));\n}`,
            cpp: `#include <iostream>\n#include <vector>\nusing namespace std;\nint main() {\n  int n;\n  if(!(cin >> n)) return 0;\n  vector<int> arr(n);\n  for(int i=0; i<n; i++) cin >> arr[i];\n  cout << solution(arr) << endl;\n  return 0;\n}`,
            java: `import java.util.*;\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    if(!sc.hasNextInt()) return;\n    int n = sc.nextInt();\n    int[] arr = new int[n];\n    for(int i=0; i<n; i++) arr[i] = sc.nextInt();\n    Solution sol = new Solution();\n    System.out.println(sol.solution(arr));\n  }\n}`
        };
    } else if (type === 'two_ints') {
        return {
            js: `const fs = require('fs');\nconst input = fs.readFileSync('/dev/stdin', 'utf-8').trim().split(' ').map(Number);\nconsole.log(solution(input[0], input[1]));`,
            cpp: `#include <iostream>\nusing namespace std;\nint main() {\n  int a, b;\n  cin >> a >> b;\n  cout << solution(a, b) << endl;\n  return 0;\n}`,
            java: `import java.util.*;\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    int a = sc.nextInt();\n    int b = sc.nextInt();\n    Solution sol = new Solution();\n    System.out.println(sol.solution(a, b));\n  }\n}`
        };
    }
    return { js: '', cpp: '', java: '' };
};

const getStartCode = (type) => {
    if (type === 'string') {
        return {
            js: `function solution(s) {\n  // your code here\n}`,
            cpp: `string solution(string s) {\n  // your code here\n}`,
            java: `class Solution {\n  public String solution(String s) {\n    // your code here\n    return "";\n  }\n}`
        };
    } else if (type === 'int') {
        return {
            js: `function solution(n) {\n  // your code here\n}`,
            cpp: `auto solution(int n) {\n  // your code here\n}`,
            java: `class Solution {\n  public Object solution(int n) {\n    // your code here\n    return null;\n  }\n}`
        };
    } else if (type === 'array') {
        return {
            js: `function solution(arr) {\n  // your code here\n}`,
            cpp: `int solution(vector<int>& arr) {\n  // your code here\n}`,
            java: `class Solution {\n  public int solution(int[] arr) {\n    // your code here\n    return 0;\n  }\n}`
        };
    } else if (type === 'two_ints') {
        return {
            js: `function solution(a, b) {\n  // your code here\n}`,
            cpp: `int solution(int a, int b) {\n  // your code here\n}`,
            java: `class Solution {\n  public int solution(int a, int b) {\n    // your code here\n    return 0;\n  }\n}`
        };
    }
};

mongoose.connect(process.env.DATABASE_URL).then(async () => {
    const Problem = require('./src/modules/problemSchema');
    const problems = await Problem.find({});
    
    for (const p of problems) {
        let type = 'string';
        if (p.title.includes('Reverse') || p.title.includes('Repeating')) type = 'string';
        else if (p.title.includes('Prime') || p.title.includes('Fibonacci') || p.title.includes('Factorial')) type = 'int';
        else if (p.title.includes('Subarray Sum')) type = 'array';
        else type = 'two_ints'; // The remaining 3 problems expect 2 numbers sum based on test cases
        
        const wrapper = getWrapper(type);
        const start = getStartCode(type);
        
        p.startCode = [
            { language: 'C++', initialCode: start.cpp },
            { language: 'Java', initialCode: start.java },
            { language: 'JavaScript', initialCode: start.js }
        ];
        
        p.driverCode = [
            { language: 'C++', code: wrapper.cpp },
            { language: 'Java', code: wrapper.java },
            { language: 'JavaScript', code: wrapper.js }
        ];
        
        await p.save();
        console.log('Updated:', p.title);
    }
    
    console.log('All problems updated with Driver Code and Start Code!');
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
