// pipeline {
//     agent any

//     stages{
//         stage{"Cloning from GitHub...."} {
//             steps{
//                 script{
//                     echo "Cloning from GitHub...."
//                     checkout scmGit(branches: [[name: '*/main']], extensions: [], userRemoteConfigs: [[credentialsId: 'github-token', url: 'https://github.com/HareeshDaxton/Hybrid_Anime_Recommender_System.git']])
//                 }
//             }
//         }
//     }
// }


pipeline {
    agent any

    stages {
        stage("Clone Repository") {
            steps {
                echo "Cloning repository..."
                checkout scmGit(
                    branches: [[name: '*/main']],
                    userRemoteConfigs: [[
                        credentialsId: 'github-token',
                        url: 'https://github.com/HareeshDaxton/Hybrid_Anime_Recommender_System.git'
                    ]]
                )
            }
        }
    }
}