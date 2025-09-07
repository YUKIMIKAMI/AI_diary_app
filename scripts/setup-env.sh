#!/bin/bash
# Bash script for secure .env setup (Mac/Linux用)

echo -e "\033[0;36mAI Diary App - 環境変数セットアップ\033[0m"
echo -e "\033[0;36m=================================\033[0m"
echo ""
echo -e "\033[0;33mAPIキーを安全に入力します。\033[0m"
echo ""

# スクリプトのディレクトリを取得
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ENV_PATH="$SCRIPT_DIR/../.env"

# .env.exampleから.envを作成
if [ -f "$SCRIPT_DIR/../.env.example" ]; then
    cp "$SCRIPT_DIR/../.env.example" "$ENV_PATH"
    echo -e "\033[0;32m.envファイルを作成しました\033[0m"
else
    echo -e "\033[0;31m.env.exampleが見つかりません\033[0m"
    exit 1
fi

# 関数: 安全に入力（エコーなし）
read_secret() {
    local prompt="$1"
    local var_name="$2"
    echo -n "$prompt: "
    read -s value
    echo ""
    if [ ! -z "$value" ]; then
        # sedを使って.envファイルを更新（macOSとLinux両対応）
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|${var_name}=.*|${var_name}=${value}|" "$ENV_PATH"
        else
            sed -i "s|${var_name}=.*|${var_name}=${value}|" "$ENV_PATH"
        fi
    fi
}

echo -e "\033[0;36m各種APIキーを入力してください（スキップする場合はEnterキーを押してください）\033[0m"
echo ""

# W&B設定
echo -e "\033[0;32m[Weights & Biases設定]\033[0m"
read_secret "WANDB_API_KEY" "WANDB_API_KEY"
echo -n "WANDB_ENTITY (あなたのユーザー名またはチーム名): "
read wandb_entity
if [ ! -z "$wandb_entity" ]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|WANDB_ENTITY=.*|WANDB_ENTITY=${wandb_entity}|" "$ENV_PATH"
    else
        sed -i "s|WANDB_ENTITY=.*|WANDB_ENTITY=${wandb_entity}|" "$ENV_PATH"
    fi
fi

echo ""
echo -e "\033[0;32m[GitHub設定]\033[0m"
read_secret "GITHUB_TOKEN" "GITHUB_TOKEN"
echo -n "GITHUB_REPO (例: username/AI_diary_app): "
read github_repo
if [ ! -z "$github_repo" ]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|GITHUB_REPO=.*|GITHUB_REPO=${github_repo}|" "$ENV_PATH"
    else
        sed -i "s|GITHUB_REPO=.*|GITHUB_REPO=${github_repo}|" "$ENV_PATH"
    fi
fi

echo ""
echo -e "\033[0;32m[AI API設定]\033[0m"
echo -e "\033[0;33m1. OpenAI\033[0m"
echo -e "\033[0;33m2. Claude (Anthropic)\033[0m"
echo -n "使用するAIプロバイダーを選択 (1 or 2): "
read ai_choice

if [ "$ai_choice" = "1" ]; then
    read_secret "OPENAI_API_KEY" "OPENAI_API_KEY"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|AI_PROVIDER=.*|AI_PROVIDER=openai|" "$ENV_PATH"
    else
        sed -i "s|AI_PROVIDER=.*|AI_PROVIDER=openai|" "$ENV_PATH"
    fi
elif [ "$ai_choice" = "2" ]; then
    read_secret "ANTHROPIC_API_KEY" "ANTHROPIC_API_KEY"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|AI_PROVIDER=.*|AI_PROVIDER=anthropic|" "$ENV_PATH"
    else
        sed -i "s|AI_PROVIDER=.*|AI_PROVIDER=anthropic|" "$ENV_PATH"
    fi
fi

echo ""
echo -e "\033[0;36m=================================\033[0m"
echo -e "\033[0;32m.envファイルの設定が完了しました！\033[0m"
echo -e "\033[0;33mファイルパス: $ENV_PATH\033[0m"
echo ""
echo -e "\033[0;31m注意事項:\033[0m"
echo -e "\033[0;31m- .envファイルは絶対にGitにコミットしないでください\033[0m"
echo -e "\033[0;31m- APIキーは定期的に更新してください\033[0m"
echo ""
echo -e "\033[0;36m次のステップ: npm install && npm run dev\033[0m"