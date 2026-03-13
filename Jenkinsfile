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
    
    environment {
        VENV_DIR = 'anime_venv'
        
    }

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

        stage("Making a virtual environment...."){
            steps{
                script{
                    echo 'Making a virtual environment...'
                    sh '''
                    python3 -m venv ${VENV_DIR}
                    . ${VENV_DIR}/bin/activate
                    pip install --upgrade pip
                    pip install -e .
                    pip install  dvc
                    '''
                }
            }
        }

        stage('DVC Pull'){
            steps{
                withCredentials([file(credentialsId:'gcp-key' , variable: 'GOOGLE_APPLICATION_CREDENTIALS' )]){
                    script{
                        echo 'DVC Pul....'
                        sh '''
                        . ${VENV_DIR}/bin/activate
                        dvc pull
                        '''
                    }
                }
            }
        }
    }
}