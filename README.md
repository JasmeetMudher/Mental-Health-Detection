# Mental Health Sentiment Analysis

A comprehensive machine learning project that analyzes text to detect and classify mental health sentiments using both traditional and deep learning approaches. The system identifies key mental health-related emotions including anxiety, depression, bipolar disorder, stress, suicidal ideation, personality disorders, and normal sentiment states.

## Project Overview
This project implements a dual-model approach to mental health sentiment classification:

- **Baseline Model:** Logistic Regression with TF-IDF vectorization and hyperparameter tuning via GridSearchCV
- **Advanced Model:** Fine-tuned RoBERTa transformer with regularization, early stopping, and class weighting


## Performance

- **Logistic Regression** accuracy: 71%, F1-Score: 0.71
- **RoBERTa** accuracy: 75.1%, F1-Score: 0.75

## Detected Sentiment Categories

- Anxiety
- Bipolar Disorder
- Depression
- Normal
- Personality Disorder
- Stress
- Suicidal Ideation



## Requirements

- Python 3.8+ (for model training and Gradio interface)
- Node.js 18+ and npm (for frontend)
- Jupyter Notebook, JupyterLab, or Google Colab (to run Model.ipynb)

---

## Local Setup

To run this project locally:

1. **Clone the repository:**
	```sh
	git clone https://github.com/JasmeetMudher/Mental-Health-Detection.git
	cd Mental-Health-Detection/ISPROJECT
	```

2. **Install dependencies:**
	```sh
	npm install
	```

3. **Set up environment variables:**
	- Copy `.env.example` to `.env` and fill in your Supabase and other required keys.

4. **Run the development server:**
	```sh
	npm run dev
	```

5. **Set up Supabase locally:**
	- Install the [Supabase CLI](https://supabase.com/docs/guides/cli)
	- Run `supabase start` to launch a local instance
	- Apply migrations from the `supabase/migrations` folder

6. **Access the app:**
	- Open [http://localhost:5173](http://localhost:5173) in your browser



## Model API (Gradio)

This project provides a Gradio-powered API and web interface for real-time mental health sentiment analysis.

### Running the Gradio Model Interface

1. Open `Model.ipynb` in Jupyter Notebook, JupyterLab, or Google Colab.
2. Run all cells in the notebook.
3. The Gradio interface will launch automatically in the output cell, providing a web UI for real-time sentiment analysis.

By default, Gradio will run on `http://127.0.0.1:7860` (locally) or provide a public link if using Colab with `share=True`.

### Connecting the Frontend

- The frontend sends requests to the Gradio API endpoint for sentiment predictions.
- If deploying, update the API URL in your frontend configuration or environment variables to point to your running Gradio server.

---

## Project Structure

```
ISPROJECT/
├── Model.ipynb                # Jupyter notebook for model training and Gradio interface
├── README.md                  # Project documentation
├── package.json               # Frontend dependencies and scripts
├── public/                    # Static assets (favicon, placeholder, etc.)
├── src/                       # Main frontend source code
│   ├── App.tsx                # Main React app entry
│   ├── main.tsx               # React DOM entry point
│   ├── index.css, App.css     # Global styles
│   ├── components/            # Reusable UI and feature components
│   │   ├── ui/                # UI primitives (Button, Input, Table, etc.)
│   │   ├── Header.tsx, Footer.tsx, ... # Layout and feature components
│   ├── pages/                 # App pages (routing targets)
│   │   ├── Analyze.tsx, Auth.tsx, ContactedUsers.tsx, User.tsx, etc.
│   ├── hooks/                 # Custom React hooks
│   ├── integrations/          # API and service integrations
│   │   └── supabase/          # Supabase client and types
│   ├── lib/                   # Utility functions
├── supabase/                  # Supabase backend config and migrations
│   ├── config.toml
│   └── migrations/            # SQL migration scripts
├── tailwind.config.ts         # Tailwind CSS config
├── tsconfig.json              # TypeScript config
└── ...                        # Other config and environment files
```

## Hardware Requirements

- **Minimum:** 8GB RAM, any CPU
- **Recommended:** 16GB+ RAM for faster training
- **GPU support:** Optional, but speeds up training significantly 
- **Developed on:** Google Colab with free NVIDIA T4 GPU

